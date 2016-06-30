const {ipcRenderer: ipc} = global.require('electron');
import {
    addTweetToTimeline,
    addTweetsToTimeline,
    addMentions,
    addUserTweets,
    addRejectedUserIds,
    addFriends,
    removeFriends,
    resetFriends,
    removeRejectedUserIds,
    addNoRetweetUserIds,
    addSeparator,
    showMessage,
    statusLiked,
    setCurrentUser,
    updateCurrentUser,
    deleteStatusInTimeline,
} from './actions';
import Store from './store';
import log from './log';
import Tweet, {TwitterUser} from './item/tweet';
import DB from './database/db';
import {Twitter, Options} from 'twit';
import TwitterRestApi from './twitter/rest_api';

interface Listeners {
    [c: string]: Electron.IpcRendererEventListener;
}

export default class IpcChannelProxy {
    private listeners: Listeners;

    constructor() {
        this.listeners = {};
    }

    subscribe(c: ChannelFromMain, cb: Function) {
        const callback: Electron.IpcRendererEventListener =
            (_, ...args) => {
                log.debug('--->', c, ...args);
                cb.apply(this, args);
            };
        ipc.on(c, callback);
        this.listeners[c] = callback;
    }

    start() {
        this.subscribe('yf:auth-tokens', (options: Options) => {
            TwitterRestApi.setupClient(options);
            // TODO:
            // Move bootstrapping to actions or dispatch actions in TwitterRestApi directly?
            return Promise.all([
                TwitterRestApi.verifyCredentials(),
                TwitterRestApi.rejectedIds(),
                TwitterRestApi.noRetweetIds(),
                TwitterRestApi.homeTimeline({
                    include_entities: true,
                    count: 20,  // TODO: fetch 40 tweets on expand_tweet == 'always'
                }),
                TwitterRestApi.mentionTimeline(),
            ])
            .then(([my_account, rejected_ids, no_retweet_ids, tweets, mentions]) => {
                Store.dispatch(setCurrentUser(new TwitterUser(my_account)));

                Store.dispatch(addRejectedUserIds(rejected_ids));
                Store.dispatch(addNoRetweetUserIds(no_retweet_ids));

                // Store.dispatch(addTweetsToTimeline(tweets.reverse().map(tw => new Tweet(tw))));
                {
                    const tws = tweets.reverse().map(tw => new Tweet(tw));
                    Store.dispatch(addTweetsToTimeline(tws.slice(0, 5)));
                    Store.dispatch(addSeparator());
                    Store.dispatch(addTweetsToTimeline(tws.slice(15)));
                }

                DB.accounts.storeAccountsInTweets(tweets);
                DB.hashtags.storeHashtagsInTweets(tweets);

                Store.dispatch(addMentions(mentions.map(j => new Tweet(j))));
                DB.accounts.storeAccountsInTweets(mentions);
                DB.hashtags.storeHashtagsInTweets(mentions);

                ipc.send('yf:start-user-stream' as ChannelFromRenderer);
            });
        });

        this.subscribe('yf:tweet', (json: Twitter.Status) => {
            if (json.retweeted_status &&
                !json.retweeted_status.retweeted &&
                Store.getState().timeline.user.id === json.user.id) {

                // XXX:
                // When user retweets a tweet, the response of statuses/retweet is correct.
                // But the retweeted status via user stream is not correct; retweeted is incorrectly
                // 'false' and retweet_count is not updated.
                // Unfortunately, response of statuses/retweet arrives earlier than user stream.
                // Therefore the correct response is overwritten by latter incorrect status via
                // user stream.  So we need to detect the incorrect status and correct it in our side.

                log.warn('Incorrect response of retweeted status via user stream. Will correct "retweeted"', json);
                json.retweeted = true;
                json.retweeted_status.retweeted = true;
            }

            const tw = new Tweet(json);
            Store.dispatch(addTweetToTimeline(tw));
            DB.accounts.storeAccountsInTweet(json);
            DB.hashtags.storeHashtagsInTweet(json);
        });

        this.subscribe('yf:connection-failure', () => {
            Store.dispatch(addSeparator());
        });

        this.subscribe('yf:api-failure', (msg: string) => {
            Store.dispatch(showMessage('API error: ' + msg, 'error'));
        });

        this.subscribe('yf:all-friend-ids', (ids: number[]) => {
            // Note:
            // When reconnecting to stream (e.g. because of PC resuming), 'friends' event
            // is sent at the first.  We can update friend id list with it rather than.
            // adding IDs.
            Store.dispatch(resetFriends(ids));
        });

        this.subscribe('yf:my-account-update', (json: Twitter.User) => {
            Store.dispatch(updateCurrentUser(json));
        });

        this.subscribe('yf:delete-status', (status: Twitter.StreamingDeleteStatus) => {
            Store.dispatch(deleteStatusInTimeline(status.id_str));
        });

        // Note:
        // User stream sends faovited event and this channel receives them.
        this.subscribe('yf:liked-status', (status: Twitter.Status, from_user: Twitter.User) => {
            Store.dispatch(statusLiked(new Tweet(status), new TwitterUser(from_user)));
        });

        this.subscribe('yf:rejected-ids', (ids: number[]) => {
            Store.dispatch(addRejectedUserIds(ids));
        });

        this.subscribe('yf:unrejected-ids', (ids: number[]) => {
            Store.dispatch(removeRejectedUserIds(ids));
        });

        this.subscribe('yf:follow', (source: Twitter.User, target: Twitter.User) => {
            if (Store.getState().timeline.user.id === source.id) {
                // Note: When I follows someone
                Store.dispatch(addFriends([target.id]));
                Store.dispatch(setCurrentUser(new TwitterUser(source)));
            } else {
                // Note: When Someone follows me
                Store.dispatch(setCurrentUser(new TwitterUser(target)));
            }
        });

        this.subscribe('yf:unfollow', (target: Twitter.User) => {
            Store.dispatch(removeFriends([target.id]));
        });

        log.debug('Started to receive messages');
        return this;
    }

    terminate() {
        for (const c in this.listeners) {
            ipc.removeListener(c, this.listeners[c]);
        }
        this.listeners = {};
        log.debug('Terminated receivers');
    }
}
