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

    fetchHomeTimeline(params: Object = {include_entities: true}) {
        // TODO: Send home timeline to 
        log.info('fetchHomeTimeline:', params);
        return Promise.resolve([] as Object[]);
    }

    sendHomeTimeline(params: Object = {include_entities: true}) {
        log.info('sendHomeTimeline:', params);
        return Promise.resolve();
    }

    fetchMentionTimeline(params: Object = {include_entities: true}) {
        log.info('fetchMentionTimeline:', params);
        return Promise.resolve([] as Object[]);
    }

    sendMentionTimeline(params: Object = {include_entities: true}) {
        log.info('sendMentionTimeline:', params);
        return Promise.resolve();
    }

    fetchMuteIds(params: Object = {}) {
        log.info('fetchMuteIds:', params);
        return Promise.resolve([] as number[]);
    }

    sendMuteIds(params: Object = {}) {
        log.info('sendMuteIds:', params);
        return Promise.resolve();
    }

    fetchNoRetweets(params: Object = {}) {
        log.info('fetchNoRetweets:', params);
        return Promise.resolve([] as number[]);
    }

    fetchBlockIds(params: Object = {}) {
        log.info('fetchBlockIds:', params);
        return Promise.resolve([] as number[]);
    }

    sendBlockIds(params: Object = {}) {
        log.info('sendBlockIds:', params);
        return Promise.resolve([] as number[]);
    }
}
