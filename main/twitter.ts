import * as Twit from 'twit';
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
    private client: Twit;
    private stream: Twit.Stream;

    constructor() {
        this.stream = null;
    }

    subscribe(c: ChannelFromRenderer, cb: Function) {
        ipc.on(c, (_, ...args) => {
            log.debug('<--- Channel:', c);
            cb.apply(this, args);
        });
    }

    sendApiFailure(err: Error, res: IncomingMessage) {
        log.error('API failure: ', err, res);
        this.sender.send('yf:api-failure', err.message);
    }

    prepareClient(tokens: Twit.ConfigKeys) {
        this.client = new Twit(tokens);
        this.subscribe('yf:request-retweet', (tweet_id: string) => this.retweet(tweet_id));
        this.subscribe('yf:undo-retweet', (tweet_id: string) => this.unretweet(tweet_id));
        this.subscribe('yf:request-like', (tweet_id: string) => this.like(tweet_id));
        this.subscribe('yf:destroy-like', (tweet_id: string) => this.unlike(tweet_id));
        this.subscribe('yf:update-status', (text: string, in_reply_to?: string) => this.updateStatus(text, in_reply_to));
        this.subscribe('yf:destroy-status', (tweet_id: string) => this.destroyStatus(tweet_id));
        this.subscribe('yf:request-follow', (user_id: number) => this.follow(user_id));
        this.subscribe('yf:request-unfollow', (user_id: number) => this.unfollow(user_id));
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
        this.client.post('statuses/update', params, (err, tweet, res) => {
            if (err) {
                this.sendApiFailure(err, res);
                return;
            }
            this.sender.send('yf:update-status-success', tweet);
            log.debug('Status update success:', tweet.id);
        });
    }

    post(path: string, params: Object, cb: (ret: any) => void) {
        this.client.post(path, params, (err, ret, res) => {
            if (err) {
                this.sendApiFailure(err, res);
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

    destroyStatus(tweet_id: string) {
        this.post('statuses/destroy/' + tweet_id, {}, ret => {
            // Note:
            // No need to send response to renderer process because
            // 'delete_status' event was already sent from streaming API.
            log.debug('Destroy status success:', ret.id);
        });
    }

    follow(user_id: number) {
        this.post('friendships/create', {user_id}, ret => {
            // Note: User stream event will be notified
            log.debug('Follow success:', ret);
        });
    }

    unfollow(user_id: number) {
        this.post('friendships/destroy', {user_id}, ret => {
            // Note: User stream event will be notified
            log.debug('Unfollow success:', ret);
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
                (err, account, res) => {
                    if (err) {
                        log.debug('verify_credentials failed:', err, account, res);
                        err.message += ' Login again.';
                        this.sendApiFailure(err, res);
                        reject(err);
                        return;
                    }
                    this.sender.send('yf:my-account', account);
                    log.debug('Verified account:', account.id_str, account.screen_name);
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
                    this.sendApiFailure(err, res);
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
            this.client.get('statuses/mentions_timeline', params, (err, tweets, res) => {
                if (err) {
                    this.sendApiFailure(err, res);
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

    fetchMuteIds(params: Object = {}) {
        return new Promise<number[]>((resolve, reject) => {
            this.client.get('mutes/users/ids', params, (err, data, res) => {
                if (err) {
                    this.sendApiFailure(err, res);
                    reject(err);
                    return;
                }
                log.debug('mutes/users/ids: Got muted ids:', data.ids.length);
                resolve(data.ids);
            });
        });
    }

    sendMuteIds(params: Object = {}) {
        return this.fetchMuteIds(params)
            .then(ids => this.sender.send('yf:rejected-ids', ids));
    }

    fetchNoRetweets(params: Object = {}) {
        return new Promise<number[]>((resolve, reject) => {
            this.client.get('friendships/no_retweets/ids', params, (err, data, res) => {
                if (err) {
                    this.sendApiFailure(err, res);
                    reject(err);
                    return;
                }
                log.debug('friendships/no_retweets/ids: Got no-retweet ids:', data.length);
                resolve(data);
            });
        });
    }

    fetchBlockIds(params: Object = {}) {
        return new Promise<number[]>((resolve, reject) => {
            this.client.get('blocks/ids', params, (err, data, res) => {
                if (err) {
                    this.sendApiFailure(err, res);
                    reject(err);
                    return;
                }
                log.debug('blocks/ids: Got block ids:', data.ids.length);
                resolve(data.ids);
            });
        });
    }

    sendBlockIds(params: Object = {}) {
        return this.fetchBlockIds(params)
            .then(ids => this.sender.send('yf:rejected-ids', ids));
    }

    connectToStream(params: Object = {}) {
        if (this.stream !== null) {
            this.stopStreaming();
        }
        this.stream = this.client.stream('user', params);

        this.stream.on('friends', msg => {
            log.debug('FRIENDS: length: ', msg.friends.length);
            this.sender.send('yf:friends', msg.friends);
        });

        this.stream.on('tweet', tw => {
            log.debug(`TWEET: @${tw.user.screen_name}: ${tw.text}`);
            this.sender.send('yf:tweet', tw);
        });

        this.stream.on('delete', e => {
            log.debug('DELETE: status: ', e.delete.status);
            this.sender.send('yf:delete-status', e.delete.status);
        });

        this.stream.on('reconnect', () => {
            log.debug('RECONNECT: Stream was disconnected unexpectedly.  Try to reconnect.');
        });

        this.stream.on('user_event', e => {
            log.debug(`${e.event.toUpperCase()}: From: @${e.source.screen_name}, To: @${e.target.screen_name}: `, e.target_object);
        });

        this.stream.on('follow', e => {
            this.sender.send('yf:follow', e.source, e.target);
        });

        this.stream.on('unfollow', e => {
            // Note: source is always me.
            this.sender.send('yf:unfollow', e.target);
        });

        this.stream.on('unknown_user_event', msg => {
            switch (msg.event) {
                case 'mute':
                    this.sender.send('yf:rejected-ids', [msg.target.id]);
                    break;
                case 'unmute':
                    this.sender.send('yf:unrejected-ids', [msg.target.id]);
                    break;
                case 'access_revoked':
                    // TODO:
                    break;
                default:
                    break;
            }
        });

        this.stream.on('limit', () => {
            this.sender.send('yf:api-failure', 'API limit have reached');
        });

        this.stream.on('disconnect', event => {
            log.debug('DISCONNECT:', event.disconnect);
            this.sender.send('yf:api-failure', 'Stream was disconnected: ' + event.disconnect.reason);
        });

        this.stream.on('direct_message', dm => {
            log.debug('DIRECT_MESSAGE:', dm);
        });

        this.stream.on('user_update', msg => {
            this.sender.send('yf:my-account-update', msg.target);
        });

        this.stream.on('favorite', msg => {
            // Note: msg.target is not used renderer process.  So I don't send it here.
            this.sender.send('yf:liked-status', msg.target_object, msg.source);
        });

        // Note:
        // I don't handle 'unfavorite' because it's already handled by responses of
        // 'favorites/create' and 'favorites/destroy'.

        // Note: Should watch more events
        //
        // this.stream.on('favorite')
        // this.stream.on('unfavorite')
        // this.stream.on('blocked')
        // this.stream.on('unblocked')
        // this.stream.on('follow')
        // this.stream.on('unfollow')
        // ...

        this.stream.on('error', err => {
            log.error('Error occurred on stream, will reconnect: ', err);
            this.sendApiFailure(err, err.twitterReply);
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
                    resolve();
                    return;
                }
                const account = JSON.parse(data) as Object;
                this.sender.send('yf:my-account', account);
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
        this.stream.stop();
        log.debug('Stream disconnected');
        this.stream = null;
    }

    isStopped() {
        return this.stream === null;
    }
}
