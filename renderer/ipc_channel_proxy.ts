const {ipcRenderer: ipc} = global.require('electron');
import {
    addTweetToTimeline,
    addSeparator,
    retweetSucceeded,
    unretweetSucceeded,
    showMessage,
    likeSucceeded,
    unlikeSucceeded,
    setCurrentUser,
    deleteStatus,
} from './actions';
import Store from './store';
import log from './log';
import Tweet, {TwitterUser} from './item/tweet';

interface Listeners {
    [c: string]: Electron.IpcRendererEventListener;
}

export default class IpcChannelProxy {
    private listeners: Listeners;

    constructor() {
        this.listeners = {};
    }

    subscribe(c: ChannelFromMain, cb: Electron.IpcRendererEventListener) {
        ipc.on(c, cb);
        this.listeners[c] = cb;
    }

    start() {
        this.subscribe('yf:tweet', (_: Electron.IpcRendererEvent, json: TweetJson) => {
            log.debug('Received channel yf:tweet', json);
            Store.dispatch(addTweetToTimeline(new Tweet(json)));
        });
        this.subscribe('yf:connection-failure', (_: Electron.IpcRendererEvent) => {
            log.debug('Received channel yf:connection-failure');
            Store.dispatch(addSeparator());
        });
        this.subscribe('yf:api-failure', (_: Electron.IpcRendererEvent, msg: string) => {
            log.debug('Received channel yf:api-failure');
            Store.dispatch(showMessage('API error: ' + msg, 'error'));
        });
        this.subscribe('yf:retweet-success', (_: Electron.IpcRendererEvent, json: TweetJson) => {
            log.debug('Received channel yf:retweet-success', json.id_str);
            if (!json.retweeted_status) {
                log.error('yf:retweet-success: Received status is not an retweet status: ', json);
                return;
            }
            // Note:
            // 'retweeted' field from API always returns 'false'
            // so we need to handle it in our side.
            json.retweeted_status.retweeted = true;
            json.retweeted_status.retweet_count += 1;
            Store.dispatch(retweetSucceeded(new Tweet(json)));
        });
        this.subscribe('yf:unretweet-success', (_: Electron.IpcRendererEvent, json: TweetJson) => {
            // Note:
            // The JSON is an original retweeted tweet
            log.debug('Received channel yf:unretweet-success', json.id_str);
            // Note:
            // 'retweeted' field from API always returns 'false'
            // so we need to handle it in our side.
            json.retweeted = false;
            json.retweet_count -= 1;
            Store.dispatch(unretweetSucceeded(new Tweet(json)));
        });
        this.subscribe('yf:like-success', (_: Electron.IpcRendererEvent, json: TweetJson) => {
            log.debug('Received channel yf:like-success', json.id_str);
            Store.dispatch(likeSucceeded(new Tweet(json)));
        });
        this.subscribe('yf:unlike-success', (_: Electron.IpcRendererEvent, json: TweetJson) => {
            log.debug('Received channel yf:unlike-success', json.id_str);
            Store.dispatch(unlikeSucceeded(new Tweet(json)));
        });
        this.subscribe('yf:account', (_: Electron.IpcRendererEvent, json: UserJson) => {
            log.debug('Received channel yf:account', json.id_str);
            Store.dispatch(setCurrentUser(new TwitterUser(json)));
        });
        this.subscribe('yf:delete-status', (_: Electron.IpcRendererEvent, json: DeleteJson) => {
            log.debug('Received channel yf:delete-status', json.status.id_str);
            Store.dispatch(deleteStatus(json.status.id_str));
        });
        this.subscribe('yf:update-status-success', (_: Electron.IpcRendererEvent, json: TweetJson) => {
            log.debug('Received channel yf:unlike-success', json.id_str);
            Store.dispatch(showMessage('Tweeted!', 'info'));
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
