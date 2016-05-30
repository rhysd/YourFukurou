const {ipcRenderer: ipc} = global.require('electron');
import {
    addTweetToTimeline,
    addMentions,
    addRejectedUserIds,
    addFriends,
    removeFriends,
    removeRejectedUserIds,
    addNoRetweetUserIds,
    addSeparator,
    retweetSucceeded,
    unretweetSucceeded,
    showMessage,
    likeSucceeded,
    unlikeSucceeded,
    statusLiked,
    setCurrentUser,
    updateCurrentUser,
    deleteStatusInTimeline,
} from './actions';
import Store from './store';
import log from './log';
import Tweet, {TwitterUser} from './item/tweet';
import DB from './database/db';
import {Twitter} from 'twit';

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
        this.subscribe('yf:tweet', (json: Twitter.Status) => {
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

        this.subscribe('yf:friends', (ids: number[]) => {
            Store.dispatch(addFriends(ids));
        });

        this.subscribe('yf:retweet-success', (json: Twitter.Status) => {
            if (!json.retweeted_status) {
                log.error('yf:retweet-success: Received status is not an retweet status: ', json);
                return;
            }
            if (!json.retweeted_status.retweeted) {
                log.error('yf:retweet-success: Retweeted tweet is NOT marked as "retweeted"', json);
                json.retweeted_status.retweeted = true;
                json.retweeted_status.retweet_count += 1;
            }
            Store.dispatch(retweetSucceeded(new Tweet(json)));
        });

        this.subscribe('yf:unretweet-success', (json: Twitter.Status) => {
            // Note:
            // The JSON is an original retweeted tweet
            if (json.retweeted) {
                log.error('yf:unretweet-success: Unretweeted tweet is marked as "retweeted"', json);
                json.retweeted = false;
                json.retweet_count -= 1;
            }
            Store.dispatch(unretweetSucceeded(new Tweet(json)));
        });

        this.subscribe('yf:like-success', (json: Twitter.Status) => {
            Store.dispatch(likeSucceeded(new Tweet(json)));
        });

        this.subscribe('yf:unlike-success', (json: Twitter.Status) => {
            Store.dispatch(unlikeSucceeded(new Tweet(json)));
        });

        this.subscribe('yf:my-account', (json: Twitter.User) => {
            Store.dispatch(setCurrentUser(new TwitterUser(json)));
        });

        this.subscribe('yf:my-account-update', (json: Twitter.User) => {
            Store.dispatch(updateCurrentUser(json));
        });

        this.subscribe('yf:delete-status', (status: Twitter.StreamingDeleteStatus) => {
            Store.dispatch(deleteStatusInTimeline(status.id_str));
        });

        this.subscribe('yf:liked-status', (status: Twitter.Status, from_user: Twitter.User) => {
            Store.dispatch(statusLiked(new Tweet(status), new TwitterUser(from_user)));
        });

        this.subscribe('yf:update-status-success', (json: Twitter.Status) => {
            Store.dispatch(showMessage('Tweeted!', 'info'));
            DB.hashtag_completion_history.storeHashtagsInTweet(json);
            DB.accounts.upCompletionCountOfMentions(json)
        });

        this.subscribe('yf:mentions', (json: Twitter.Status[]) => {
            Store.dispatch(addMentions(json.map(j => new Tweet(j))));
            DB.accounts.storeAccountsInTweets(json);
            DB.hashtags.storeHashtagsInTweets(json);
            // Note:
            // Do not notify mentions because this IPC message is sent from main
            // process at app starting.  If we were to notify mentions here, so many
            // notifications are sent to a user.
        });

        this.subscribe('yf:rejected-ids', (ids: number[]) => {
            Store.dispatch(addRejectedUserIds(ids));
            DB.rejected_ids.storeIds(ids);
        });

        this.subscribe('yf:unrejected-ids', (ids: number[]) => {
            Store.dispatch(removeRejectedUserIds(ids));
            DB.rejected_ids.deleteIds(ids);
        });

        this.subscribe('yf:no-retweet-ids', (ids: number[]) => {
            Store.dispatch(addNoRetweetUserIds(ids));
            // TODO?
            // Add no-retweet-users to database
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
