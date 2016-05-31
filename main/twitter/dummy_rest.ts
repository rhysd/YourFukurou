import {join} from 'path';
import {readFile} from 'fs';
import {app} from 'electron';
import * as Ipc from '../ipc';
import log from '../log';

export default class DummyRestAPI {
    private subscriber: Ipc.Subscriber;

    constructor(private sender: Ipc.Sender) {
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

    updateStatus(text: string, in_reply_to?: string) {
        log.info('updateStatus:', text, in_reply_to);
    }

    post(path: string, params: Object, cb: (ret: any) => void) {
        log.info('post:', path, params);
    }

    like(tweet_id: string) {
        log.info('like:', tweet_id);
    }

    unlike(tweet_id: string) {
        log.info('unlike:', tweet_id);
    }

    retweet(tweet_id: string) {
        log.info('retweet:', tweet_id);
    }

    unretweet(tweet_id: string) {
        log.info('unretweet:', tweet_id);
    }

    destroyStatus(tweet_id: string) {
        log.info('destroyStatus:', tweet_id);
    }

    follow(user_id: number) {
        log.info('follow:', user_id);
    }

    unfollow(user_id: number) {
        log.info('unfollow:', user_id);
    }

    sendAuthenticatedAccount() {
        return this.readJson('dummy_account.json')
            .then(account => this.sender.send('yf:my-account', account));
    }

    fetchHomeTimeline(params: Object = {include_entities: true}) {
        // TODO: Send home timeline to 
        log.info('fetchHomeTimeline:', params);
        return this.readJson('dummy_home_tweets.json')
            .catch(e => [] as Object[]);
    }

    sendHomeTimeline(params: Object = {include_entities: true}) {
        log.info('sendHomeTimeline:', params);
        return this.fetchHomeTimeline(params)
            .then(tweets => {
                for (const tw of tweets) {
                    this.sender.send('yf:tweet', tw);
                }
            });
    }

    fetchMentionTimeline(params: Object = {include_entities: true}) {
        log.info('fetchMentionTimeline:', params);
        return this.readJson('dummy_mention_tweets.json')
            .catch(e => [] as Object[]);
    }

    sendMentionTimeline(params: Object = {include_entities: true}) {
        log.info('sendMentionTimeline:', params);
        return this.fetchMentionTimeline(params)
            .then(tweets => this.sender.send('yf:mentions', tweets));
    }

    fetchMuteIds(params: Object = {}) {
        log.info('fetchMuteIds:', params);
        return this.readJson('dummy_mute_ids.json').catch(e => [] as number[]);
    }

    sendMuteIds(params: Object = {}) {
        log.info('sendMuteIds:', params);
        return this.fetchMuteIds(params)
            .then(ids => this.sender.send('yf:rejected-ids', ids));
    }

    fetchNoRetweets(params: Object = {}) {
        log.info('fetchNoRetweets:', params);
        return this.readJson('dummy_nortweet_ids.json').catch(e => [] as number[]);
    }

    fetchBlockIds(params: Object = {}) {
        log.info('fetchBlockIds:', params);
        return this.readJson('dummy_block_ids.json').catch(e => [] as number[]);
    }

    sendBlockIds(params: Object = {}) {
        log.info('sendBlockIds:', params);
        return this.fetchBlockIds(params)
            .then(ids => this.sender.send('yf:rejected-ids', ids));
    }

    private readJson(file: string) {
        const json_path = join(app.getPath('userData'), file);
        return new Promise<any>((resolve, reject) => {
            readFile(json_path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data));
            });
        }).catch((e: Error) => {
            log.error(e);
            throw e;
        });
    }

}
