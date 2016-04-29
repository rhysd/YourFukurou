import {Action, Kind} from '../actions';

const electron = global.require('electron');
const ipc = electron.ipcRenderer;

function sendToMain(ch: ChannelFromRenderer, ...args: any[]) {
    'use strict';
    ipc.send(ch, ...args);
}

export default function statelessActions(state: {} = null, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.SendRetweet: {
            // Note:
            // The retweeted status will be sent on stream
            sendToMain('yf:request-retweet', action.tweet_id);
            break;
        }
        case Kind.UndoRetweet: {
            sendToMain('yf:undo-retweet', action.tweet_id);
            break;
        }
        case Kind.CreateLike: {
            // Note:
            // The likeed status will be sent on stream
            sendToMain('yf:request-like', action.tweet_id);
            break;
        }
        case Kind.DestroyLike: {
            sendToMain('yf:destroy-like', action.tweet_id);
            break;
        }
        default:
            break;
    }
    return state;
}

