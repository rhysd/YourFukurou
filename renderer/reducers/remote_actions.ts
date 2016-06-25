import {Action, Kind} from '../actions';

const electron = global.require('electron');
const ipc = electron.ipcRenderer;

function sendToMain(ch: ChannelFromRenderer, ...args: any[]) {
    ipc.send(ch, ...args);
}

export default function remoteActions(state: {} = null, action: Action) {
    switch (action.type) {
        case Kind.DestroyStatus:
            sendToMain('yf:destroy-status', action.tweet_id);
            break;
        case Kind.Follow:
            sendToMain('yf:request-follow', action.user_id);
            break;
        case Kind.Unfollow:
            sendToMain('yf:request-unfollow', action.user_id);
            break;
        case Kind.OpenUserTimeline:
            sendToMain('yf:request-user-timeline', action.user.id);
            break;
        default:
            break;
    }
    return state;
}
