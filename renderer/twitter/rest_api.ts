import {IncomingMessage} from 'http';
import * as Twit from 'twit';
import log from '../log';

type Status = Twit.Twitter.Status;
type User = Twit.Twitter.User;

export default class TwitterRestAPI {
    client: Twit;

    constructor() {
        this.client = null;
    }

    setupClient(options: Twit.Options) {
        this.client = new Twit(options);
    }

    showApiFailure(name: string, err: Error, res: IncomingMessage) {
        log.error('API failure: ', name, err, res);
        // TODO:
        // Show message using <Message>
    }

    post<T>(name: string, params: Object = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.post(name, params, (err, data, res) => {
                if (err) {
                    this.showApiFailure(name, err, res);
                    reject(err);
                    return;
                }
                log.debug('POST:', name, data);
                resolve(data);
            });
        });
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
        return this.post<Status>('statuses/update', params);
    }

    like(tweet_id: string) {
        const params = {
            id: tweet_id,
            include_entities: true,
        };
        return this.post<Status>('favorites/create', params);
    }

    unlike(tweet_id: string) {
        const params = {
            id: tweet_id,
            include_entities: true,
        };
        return this.post<Status>('favorites/destroy', params);
    }

    retweet(tweet_id: string) {
        return this.post<Status>('statuses/retweet/' + tweet_id);
    }

    unretweet(tweet_id: string) {
        return this.post<Status>('statuses/unretweet/' + tweet_id);
    }

    destroyStatus(tweet_id: string) {
        // TODO:
        // No need to send response to renderer process because
        // 'delete_status' event was already sent from streaming API.
        return this.post<Status>('statuses/destroy/' + tweet_id);
    }

    follow(user_id: number) {
        return this.post<User>('friendships/create', {user_id});
    }

    unfollow(user_id: number) {
        return this.post<User>('friendships/destroy', {user_id});
    }

    get<T>(name: string, params: Object = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.get(name, params, (err, data, res) => {
                if (err) {
                    this.showApiFailure(name, err, res);
                    reject(err);
                    return;
                }
                log.debug('GET:', name, data);
                resolve(data);
            });
        });
    }

    verifyAccount() {
        const params = {
            include_entities: true,
        };
        return this.get<User>('account/verify_credentials', params);
    }

    homeTimeline(params: Object = {include_entities: true}) {
        return this.get<Status[]>('statuses/home_timeline', params);
    }

    mentionTimeline(params: Object = {include_entities: true}) {
        return this.get<Status[]>('statuses/mentions_timeline', params);
    }

    muteIds(params: Object = {}) {
        return this.get<number[]>('mutes/users/ids', params);
    }

    noRetweetIds(params: Object = {}) {
        return this.get<number[]>('friendships/no_retweets/ids', params);
    }

    blockIds(params: Object = {}) {
        return this.get<number[]>('blocks/ids', params);
    }

    rejectedIds() {
        return Promise.all([this.muteIds(), this.blockIds()]).then(([mute_ids, block_ids]) => {
            Array.prototype.push.apply(mute_ids, block_ids);
            return mute_ids;
        });
    }

    userTimeline(
        user_id: number,
        include_rts = true,
        exclude_replies = false,
        count = 40
    ) {
        const params = {
            user_id,
            trim_user: false,
            include_rts,
            exclude_replies,
            count,
        };
        return this.get<Status[]>('statuses/user_timeline', params);
    }
}
