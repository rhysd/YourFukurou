import * as Twit from 'twit';
import log from '../log';
import {UnderlyingClient, DummyClient, TwitClient} from './clients';

type Status = Twit.Twitter.Status;
type User = Twit.Twitter.User;

export class TwitterRestApi {
    constructor(public client: UnderlyingClient) {
    }

    setupClient(options: Twit.Options) {
        this.client.setupClient(options);
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
        return this.client.post<Status>('statuses/update', params);
    }

    like(tweet_id: string) {
        const params = {
            id: tweet_id,
            include_entities: true,
        };
        return this.client.post<Status>('favorites/create', params);
    }

    unlike(tweet_id: string) {
        const params = {
            id: tweet_id,
            include_entities: true,
        };
        return this.client.post<Status>('favorites/destroy', params);
    }

    retweet(tweet_id: string) {
        return this.client.post<Status>('statuses/retweet/' + tweet_id);
    }

    unretweet(tweet_id: string) {
        return this.client.post<Status>('statuses/unretweet/' + tweet_id);
    }

    destroyStatus(tweet_id: string) {
        // TODO:
        // No need to send response to renderer process because
        // 'delete_status' event was already sent from streaming API.
        return this.client.post<Status>('statuses/destroy/' + tweet_id);
    }

    follow(user_id: number) {
        return this.client.post<User>('friendships/create', {user_id});
    }

    unfollow(user_id: number) {
        return this.client.post<User>('friendships/destroy', {user_id});
    }

    verifyCredentials() {
        const params = {
            include_entities: true,
        };
        return this.client.get<User>('account/verify_credentials', params);
    }

    homeTimeline(params: Object = {include_entities: true}) {
        return this.client.get<Status[]>('statuses/home_timeline', params);
    }

    mentionTimeline(params: Object = {include_entities: true}) {
        return this.client.get<Status[]>('statuses/mentions_timeline', params);
    }

    muteIds(params: Object = {}) {
        return this.client.get<number[]>('mutes/users/ids', params);
    }

    noRetweetIds(params: Object = {}) {
        return this.client.get<number[]>('friendships/no_retweets/ids', params);
    }

    blockIds(params: Object = {}) {
        return this.client.get<number[]>('blocks/ids', params);
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
        return this.client.get<Status[]>('statuses/user_timeline', params);
    }
}

export default new TwitterRestApi(
    process.env.YOURFUKUROU_USE_FIXTURE ?
        new DummyClient() : new TwitClient()
);

