import * as TwitterClient from 'twitter';
import {app, ipcMain as ipc} from 'electron';
import {join} from 'path';
import {readFile} from 'fs';
import log from './log';
import IpcSender from './ipc_sender';
import {IncomingMessage} from 'http';

// TODO:
// This class should be invoked from renderer for each Twitter account
export default class Twitter {
    public sender: IpcSender;
    private client: NodeTwitter.TwitterClient;
    private stream: NodeTwitter.TwitterStream;

    constructor() {
        this.stream = null;
    }

    subscribe(c: ChannelFromRenderer, cb: Electron.IpcMainEventListener) {
        ipc.on(c, cb);
    }

    sendApiFailure(err: NodeTwitter.ApiError[] | Error) {
        this.sender.send('yf:api-failure', err instanceof Array ? err[0].message : err.message);
    }

    prepareClient(tokens: NodeTwitter.AuthInfo) {
        this.client = new TwitterClient(tokens);
        this.subscribe('yf:request-retweet', (_: Electron.IpcMainEvent, tweet_id: string) => this.retweet(tweet_id));
        this.subscribe('yf:undo-retweet', (_: Electron.IpcMainEvent, tweet_id: string) => this.unretweet(tweet_id));
        this.subscribe('yf:request-like', (_: Electron.IpcMainEvent, tweet_id: string) => this.like(tweet_id));
        this.subscribe('yf:destroy-like', (_: Electron.IpcMainEvent, tweet_id: string) => this.unlike(tweet_id));
        this.subscribe('yf:update-status', (_: Electron.IpcMainEvent, text: string, in_reply_to?: string) => this.updateStatus(text, in_reply_to));
    }

    updateStatus(text: string, in_reply_to?: string) {
        const params = {
            status: text,
            in_reply_to_status_id: undefined as string,
            trim_user: false,
        };
        if (in_reply_to) {
            params.in_reply_to_status_id = in_reply_to;
        }
        this.client.post('statuses/update', params, (err: NodeTwitter.ApiError[], tweet: any, res: any) => {
            if (err) {
                log.debug('Status update failed:', text, in_reply_to, err, res);
                this.sendApiFailure(err);
                return;
            }
            this.sender.send('yf:update-status-success', tweet);
            log.debug('Status update success:', tweet.id);
        });
    }

    post(path: string, params: Object, cb: (ret: any) => void) {
        this.client.post(path, params, (err, ret, res) => {
            if (err) {
                log.debug(path + ' failed:', JSON.stringify(params), err);
                this.sendApiFailure(err);
                return;
            }
            cb(ret);
        });
    }

    like(tweet_id: string) {
        const params = {
            id: tweet_id,
            include_entities: true,
        };
        this.post('favorites/create', params, ret => {
            this.sender.send('yf:like-success', ret);
            log.debug('Like success:', ret.id);
        });
    }

    unlike(tweet_id: string) {
        const params = {
            id: tweet_id,
            include_entities: true,
        };
        this.post('favorites/destroy', params, ret => {
            this.sender.send('yf:unlike-success', ret);
            log.debug('Unlike success:', ret.id);
        });
    }

    retweet(tweet_id: string) {
        this.post('statuses/retweet/' + tweet_id, {}, ret => {
            this.sender.send('yf:retweet-success', ret);
            log.debug('Retweet success:', ret.id);
        });
    }

    unretweet(tweet_id: string) {
        this.post('statuses/unretweet/' + tweet_id, {}, ret => {
            this.sender.send('yf:unretweet-success', ret);
            log.debug('Unretweet success:', ret.id);
        });
    }

    sendAuthenticatedAccount() {
        const params = {
            include_entities: true,
        };
        return new Promise<void>((resolve, reject) => {
            this.client.get(
                'account/verify_credentials',
                params,
                (err: NodeTwitter.ApiError[], account: any, res: any) => {
                    if (err) {
                        log.debug('verify_credentials failed:', err, account, res);
                        if (err[0] !== undefined) {
                            err[0].message += ' Login again.';
                        }
                        this.sendApiFailure(err);
                        reject(err);
                        return;
                    }
                    this.sender.send('yf:account', account);
                    log.debug('Account:', account.id_str, account.screen_name);
                    resolve();
                }
            );
        });
    }

    fetchHomeTimeline(params: Object = {include_entities: true}) {
        return new Promise<Object[]>((resolve, reject) => {
            this.client.get('statuses/home_timeline', params, (err, tweets, res) => {
                if (err) {
                    log.debug('Home timeline failed: ', tweets, res);
                    this.sendApiFailure(err);
                    reject(err);
                    return;
                }
                log.debug('statuses/home_timeline: Got tweets:', tweets.length);
                resolve(tweets.reverse());
            });
        });
    }

    sendHomeTimeline(params: Object = {include_entities: true}) {
        return this.fetchHomeTimeline(params)
            .then(tweets => {
                for (const tw of tweets) {
                    this.sender.send('yf:tweet', tw);
                }
            });
    }

    fetchMentionTimeline(params: Object = {include_entities: true}) {
        return new Promise<Object[]>((resolve, reject) => {
            this.client.get('statuses/mentions_timeline', params, (err, tweets) => {
                if (err) {
                    log.debug('Mentions timeline failed:', tweets);
                    this.sendApiFailure(err);
                    reject(err);
                    return;
                }
                log.debug('statuses/mentions_timeline: Got tweets:', tweets.length);
                resolve(tweets);
            });
        });
    }

    sendMentionTimeline(params: Object = {include_entities: true}) {
        return this.fetchMentionTimeline(params)
            .then(tweets => this.sender.send('yf:mentions', tweets));
    }

    subscribeStream(stream: NodeTwitter.TwitterStream, params: Object = {}) {
        stream.on('data', json => {
            if (json === undefined) {
                return;
            }

            if (json.text) {
                this.sender.send('yf:tweet', json);
                return;
            }

            if (json.delete) {
                this.sender.send('yf:delete-status', json.delete);
                return;
            }

            if (json.friends) {
                this.sender.send('yf:friends', json.friends);
                return;
            }

            log.info('Ignored message on stream:', json);
        });

        stream.on('error', (err: Error) => {
            log.error('Error occurred on stream, will reconnect after 3secs: ', err);
            this.reconnectToStream().catch(e => log.error('Error on reconnecting because of stream error', e));
        });

        stream.on('end', (response: IncomingMessage) => {
            log.error('Unexpected end message on stream, will reconnect after 3secs: ', response.statusCode);
            // TODO:
            // Handle the tweets while stream was not connected
            this.reconnectToStream().catch(e => log.error('Error on reconnecting because of unexpected stream end', e));
        });
    }

    connectToStream(params: Object = {}) {
        if (this.stream !== null) {
            this.stopStreaming();
        }
        return new Promise<void>(resolve => {
            this.client.stream('user', params, stream => {
                log.debug('Stream connected');
                this.stream = stream;
                this.subscribeStream(stream);
            });
        });
    }

    sendConnectionFailure() {
        this.sender.send('yf:connection-failure');
    }

    reconnectToStream(delay_ms: number = 3000, params: Object = {}) {
        return new Promise<void>(resolve => {
            this.sendConnectionFailure();
            setTimeout(delay_ms, () => {
                this.connectToStream(params);
                resolve();
            });
        });
    }

    sendDummyAccount() {
        const dummy_json_path = join(app.getPath('userData'), 'account.json');
        return new Promise<void>((resolve, reject) => {
            readFile(dummy_json_path, 'utf8', (err, data) => {
                if (err) {
                    log.error('File not found:', dummy_json_path);
                    reject();
                    return;
                }
                const account = JSON.parse(data) as Object;
                this.sender.send('yf:account', account);
                log.debug('Dummy account:', account);
                resolve();
            });
        });
    }

    sendDummyStream() {
        log.debug('Starting to send dummy stream');
        const dummy_json_path = join(app.getPath('userData'), 'tweets.json');
        return new Promise<void>((resolve, reject) => {
            readFile(dummy_json_path, 'utf8', (err, data) => {
                if (err) {
                    log.error('File not found:', dummy_json_path);
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
                    if (random_range(0, 20) < 1) {
                        this.sender.send('yf:connection-failure');
                    }
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
