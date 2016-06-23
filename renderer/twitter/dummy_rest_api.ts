import * as Twit from 'twit';
import log from '../log';
import Fixture from './fixture';

type Status = Twit.Twitter.Status;
type User = Twit.Twitter.User;

// Note:
// Should we need to reduce duplicates between rest_api and dummy_rest_api?
//
//   1. Make TwitClient class. Implement .post() and .get() methods
//   2. Make DummyClient class. Implement .post() and .get() methods.  They will
//      read corresponding keys in dummy JSON files instead of sending POST or GET
//      request.
//   3. Create TwitterRestAPI<ClientType> class.  Create ClientType instance
//      and use it for calling Twitter APIs.
//   4. In normal case, we will use TwitterRestAPI<TwitClient>.  And in use case
//      of dummy response, we will use TwitterRestAPI<DummyClient>.
//
// This will use the same TwitterRestAPI<ClientType> class implementation and it's
// better than current implementation.

export default class DummyRestAPI {
    private fixture: Fixture;

    constructor() {
        this.fixture = new Fixture();
    }

    setupClient(_: Twit.Options) {
        // Do nothing
    }

    notSupportedAPI() {
        return Promise.reject(new Error('Dummy client does not support this API'));
    }

    updateStatus(text: string, in_reply_to?: string) {
        log.info('updateStatus:', text, in_reply_to);
        return this.notSupportedAPI();
    }

    post(path: string, params: Object, cb: (ret: any) => void) {
        log.info('post:', path, params);
        return this.notSupportedAPI();
    }

    like(tweet_id: string) {
        log.info('like:', tweet_id);
        return this.notSupportedAPI();
    }

    unlike(tweet_id: string) {
        log.info('unlike:', tweet_id);
        return this.notSupportedAPI();
    }

    retweet(tweet_id: string) {
        log.info('retweet:', tweet_id);
        return this.notSupportedAPI();
    }

    unretweet(tweet_id: string) {
        log.info('unretweet:', tweet_id);
        return this.notSupportedAPI();
    }

    destroyStatus(tweet_id: string) {
        log.info('destroyStatus:', tweet_id);
        return this.notSupportedAPI();
    }

    follow(user_id: number) {
        log.info('follow:', user_id);
        return this.notSupportedAPI();
    }

    unfollow(user_id: number) {
        log.info('unfollow:', user_id);
        return this.notSupportedAPI();
    }

    verifyAccount() {
        return this.fixture.read<User>('account');
    }

    homeTimeline(params: Object = {include_entities: true}) {
        log.info('homeTimeline:', params);
        return this.fixture.read<Status[]>('home_tweets').catch(e => []);
    }

    mentionTimeline(params: Object = {include_entities: true}) {
        log.info('mentionTimeline:', params);
        return this.fixture.read<Status[]>('mention_tweets').catch(e => []);
    }

    muteIds(params: Object = {}) {
        log.info('muteIds:', params);
        return this.fixture.read<number[]>('mute_ids').catch(e => []);
    }

    noRetweetIds(params: Object = {}) {
        log.info('noRetweets:', params);
        return this.fixture.read<number[]>('noretweet_ids').catch(e => []);
    }

    blockIds(params: Object = {}) {
        log.info('blockIds:', params);
        return this.fixture.read<number[]>('block_ids').catch(e => []);
    }

    userTimeline(
        user_id: number,
        include_rts = true,
        exclude_replies = false,
        count = 40
    ) {
        return this.fixture.read<Status[]>('user_timeline').catch(e => []);
    }
}
