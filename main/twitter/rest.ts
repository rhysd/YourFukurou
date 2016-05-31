import {join} from 'path';
import {readFile} from 'fs';
import {IncomingMessage} from 'http';
import {app} from 'electron';
import * as Twit from 'twit';
import * as Ipc from '../ipc';
import log from '../log';

export default class TwitterRestAPI {
    private subscriber: Ipc.Subscriber;

    constructor(
        private sender: Ipc.Sender,
        public client: Twit
    ) {
        const s = new Ipc.Subscriber();
        s.subscribe('yf:request-retweet', (tweet_id: string) => this.retweet(tweet_id));
        s.subscribe('yf:undo-retweet', (tweet_id: string) => this.unretweet(tweet_id));
        s.subscribe('yf:request-like', (tweet_id: string) => this.like(tweet_id));
        s.subscribe('yf:destroy-like', (tweet_id: string) => this.unlike(tweet_id));
        s.subscribe('yf:update-status', (text: string, in_reply_to?: string) => this.updateStatus(text, in_reply_to));
        s.subscribe('yf:destroy-status', (tweet_id: string) => this.destroyStatus(tweet_id));
        s.subscribe('yf:request-follow', (user_id: number) => this.follow(user_id));
        s.subscribe('yf:request-unfollow', (user_id: number) => this.unfollow(user_id));
        this.subscriber = s;
    }

    sendApiFailure(err: Error, res: IncomingMessage) {
        log.error('API failure: ', err, res);
        this.sender.send('yf:api-failure', err.message);
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
}
