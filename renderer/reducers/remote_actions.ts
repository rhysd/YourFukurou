import {Action, Kind} from '../actions';

const electron = global.require('electron');
const ipc = electron.ipcRenderer;

function sendToMain(ch: ChannelFromRenderer, ...args: any[]) {
    'use strict';
    ipc.send(ch, ...args);
}

export default function remoteActions(state: {} = null, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.SendRetweet:
            // Note:
            // The retweeted status will be sent on stream
            sendToMain('yf:request-retweet', action.tweet_id);
            break;
        case Kind.UndoRetweet:
            sendToMain('yf:undo-retweet', action.tweet_id);
            break;
        case Kind.CreateLike:
            // Note:
            // The likeed status will be sent on stream
            sendToMain('yf:request-like', action.tweet_id);
            break;
        case Kind.DestroyLike:
            sendToMain('yf:destroy-like', action.tweet_id);
            break;
        case Kind.UpdateStatus:
            // Note:
            // Add more status information (e.g. picture to upload)
            sendToMain('yf:update-status', action.text, action.in_reply_to_id);
            break;
        case Kind.DestroyStatus:
            sendToMain('yf:destroy-status', action.tweet_id);
            break;
        case Kind.Follow:
            sendToMain('yf:request-follow', action.user_id);
            break;
        case Kind.Unfollow:
            sendToMain('yf:request-unfollow', action.user_id);
            break;
        default:
            break;
    }
    return state;
}
