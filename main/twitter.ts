import * as TwitterClient from 'twitter';
import {app} from 'electron';
import {join} from 'path';
import {readFile} from 'fs';
import log from './log';
import IpcSender from './ipc_sender';
import {IncomingMessage} from 'http';

// TODO:
// This class should be invoked from renderer for each Twitter account
export default class Twitter {
    private client: NodeTwitter.TwitterClient;
    private sender: IpcSender;
    private stream: NodeTwitter.TwitterStream;

    constructor() {
        this.stream = null;
    }

    prepareClient(tokens: NodeTwitter.AuthInfo) {
        this.client = new TwitterClient(tokens);
    }

    startStreaming(to: IpcSender, params: Object = {}) {
        this.sender = to;
        if (!this.client) {
            log.error('Client is not created yet');
            return;
        }
        if (this.stream !== null) {
            log.debug('Starting stream while previous stream is not disconnected. Will disconnect.');
            this.stopStreaming();
        }
        if (process.env.NODE_ENV === 'development' && process.env.YOURFUKUROU_DUMMY_TWEETS) {
            return this.sendDummyStream();
        }
        return this.sendHomeTimeline()
            .catch(e => log.error('Failed to send home timeline', e))
            .then(() => this.connectToStream(params));
    }

    sendHomeTimeline(params: Object = {}) {
        return new Promise<void>((resolve, reject) => {
            this.client.get('statuses/home_timeline', params, (err, tweets, _) => {
                if (err) {
                    reject(err);
                    return;
                }
                log.debug('statuses/home_timeline: Got tweets: ' + tweets.length);
                for (const tw of tweets) {
                    this.sender.send('yf:tweet', tw);
                }
                resolve();
            });
        });
    }

    subscribeStream(stream: NodeTwitter.TwitterStream, params: Object = {}) {
        stream.on('data', json => {
            if (json === undefined) {
                return;
            }

            if (!('text' in json)) {
                // TODO:
                // Ignore activities except for tweets
                log.info('Ignored message on stream: ' + JSON.stringify(json));
                return;
            }

            this.sender.send('yf:tweet', json);
        });

        stream.on('error', (err: Error) => {
            log.error('Error occurred on stream, will reconnect after 3secs: ', err);
            setTimeout(3000, () => this.connectToStream(params));
        });

        stream.on('end', (response: IncomingMessage) => {
            log.error('Unexpected end message on stream, will reconnect after 3secs: ', response.statusCode);
            // TODO:
            // Handle the tweets while stream was not connected
            setTimeout(3000, () => this.connectToStream(params));
        });
    }

    connectToStream(params: Object = {}) {
        this.client.stream('user', params, stream => {
            log.debug('Stream connected');
            this.stream = stream;
            this.subscribeStream(stream);
        });
    }

    fetchStreaming(params: Object = {}) {
        return new Promise<void>(resolve => {
            this.connectToStream(params);
            resolve();
        });
    }

    sendDummyStream() {
        log.debug('Starting to send dummy stream');
        const dummy_json_path = join(app.getPath('userData'), 'tweets.json');
        return new Promise<void>((resolve, reject) => {
            readFile(dummy_json_path, 'utf8', (err, data) => {
                if (err) {
                    log.error('File not found: ' + dummy_json_path);
                    reject();
                    return;
                }
                const tweets = JSON.parse(data) as Object[];
                let idx = 0;

                const random_range =
                    (min: number, max: number) => Math.random() * (max - min) + min;

                const send_all = () => {
                    this.sender.send('yf:tweet', tweets[idx]);
                    ++idx;
                    if (idx < tweets.length) {
                        setTimeout(send_all, random_range(500, 5000));
                    }
                };

                send_all();
                resolve();
            });
        });
    }

    stopStreaming() {
        if (this.stream === null) {
            log.debug('Stream already stopped');
            return;
        }
        this.stream.removeAllListeners('data');
        this.stream.removeAllListeners('error');
        this.stream.removeAllListeners('end');
        this.stream.destroy();
        log.debug('Stream disconnected');
        this.stream = null;
    }

    isStopped() {
        return this.stream === null;
    }
}
