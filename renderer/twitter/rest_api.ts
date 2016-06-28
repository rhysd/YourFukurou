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
        return this.client.post<Status>('statuses/retweet/' + tweet_id)
            .then(json => {
                if (!json.retweeted_status) {
                    log.error('Received status is not an retweet status: ', json);
                    return json;
                }
                if (!json.retweeted_status.retweeted) {
                    log.warn('Retweeted tweet is NOT marked as "retweeted", workaround.', json);
                    json.retweeted_status.retweeted = true;
                    json.retweeted_status.retweet_count += 1;
                }
                return json;
            });
    }

    unretweet(tweet_id: string) {
        return this.client.post<Status>('statuses/unretweet/' + tweet_id)
            .then(json => {
                // Note:
                // The JSON is an original retweeted tweet
                if (json.retweeted) {
                    log.warn('Unretweeted tweet is marked as "retweeted", workaround', json);
                    json.retweeted = false;
                    json.retweet_count -= 1;
                }
                return json;
            });
    }

    destroyStatus(tweet_id: string) {
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

    // TODO: Return array of Tweet objects
    homeTimeline(params: Object = {include_entities: true}) {
        return this.client.get<Status[]>('statuses/home_timeline', params);
    }

    // TODO: Return array of Tweet objects
    mentionTimeline(params: Object = {include_entities: true}) {
        return this.client.get<Status[]>('statuses/mentions_timeline', params);
    }

    muteIds(params: Object = {}) {
        return this.client.get<any>('mutes/users/ids', params).then(res => res.ids as number[]);
    }

    blockIds(params: Object = {}) {
        return this.client.get<any>('blocks/ids', params).then(res => res.ids as number[]);
    }

    noRetweetIds(params: Object = {}) {
        return this.client.get<number[]>('friendships/no_retweets/ids', params);
    }

    rejectedIds() {
        return Promise.all([this.muteIds(), this.blockIds()]).then(([mute_ids, block_ids]) => {
            Array.prototype.push.apply(mute_ids, block_ids);
            return mute_ids;
        });
    }

    userTimeline(user_id: number, params: Object = {}) {
        params = Object.assign({
            user_id,
            include_rts: true,
            exclude_replies: false,
            count: 40,
        }, params);
        return this.client.get<Status[]>('statuses/user_timeline', params);
    }

    missingHomeTimeline(max_id: string, since_id: string) {
        return this.missingTimeline('statuses/home_timeline', max_id, since_id);
    }

    missingMentionTimeline(max_id: string, since_id: string) {
        return this.missingTimeline('statuses/mention_timeline', max_id, since_id);
    }

    // Note:
    // This will return statuses with the range [max_id..since_id).
    //
    // 'max_id' status            A status just after 'since_id' status
    //   |                         |
    //   V                         V
    // [Tweet, Tweet, Tweet, ..., Tweet]
    //
    // Both max_id and since_id can be undefined.
    private missingTimeline(path: string, max_id: string, since_id: string) {
        const params = {
            include_entities: true,
            max_id,
            since_id,
            count: 40,
        };
        return this.client.get<Status[]>(path, params).then(ss => {
            console.log('MISSING_TIMELINE: ' + path, params, ss);
            return ss;
        });
    }
}

export default new TwitterRestApi(
    process.env.YOURFUKUROU_USE_FIXTURE ?
        new DummyClient() : new TwitClient()
);

