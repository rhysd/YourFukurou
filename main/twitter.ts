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

    prepare_client(tokens: NodeTwitter.AuthInfo) {
        this.client = new TwitterClient(tokens);
    }

    start_streaming(to: IpcSender, params: Object = {}) {
        this.sender = to;
        if (!this.client) {
            log.error('Client is not created yet');
            return;
        }
        if (process.env.NODE_ENV === 'development' && process.env.YOURFUKUROU_DUMMY_TWEETS !== '') {
            return this.send_dummy_stream();
        }
        return this.send_home_timeline()
            .catch(e => log.error('Failed to send home timeline', e))
            .then(() => this.send_stream(params));
    }

    subscribe_stream(stream: NodeTwitter.TwitterStream, params: Object = {}) {
        stream.on('data', json => {
            if (json === undefined) {
                return;
            }

            if (!('text' in json)) {
                // TODO:
                // Ignore activities except for tweets
                return;
            }

            this.sender.send('yf:tweet', json);
        });

        stream.on('error', (err: Error) => {
            log.error(err);
        });

        stream.on('end', (response: IncomingMessage) => {
            log.error('End message on stream: ', response.statusCode);
            setTimeout(3000, () => this.send_stream(params));
        });
    }

    send_home_timeline(params: Object = {}) {
        return new Promise<void>((resolve, reject) => {
            this.client.get('statuses/home_timeline', params, (err, tweets, _) => {
                if (err) {
                    reject(err);
                    return;
                }
                for (const tw of tweets) {
                    this.sender.send('yf:tweet', tw);
                }
            });
        });
    }

    send_stream(params: Object = {}) {
        this.client.stream('user', params, stream => {
            this.subscribe_stream(stream);
        });
    }

    send_dummy_stream() {
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
}
