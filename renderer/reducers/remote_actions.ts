import {Action, Kind} from '../actions';

const electron = global.require('electron');
const ipc = electron.ipcRenderer;

function sendToMain(ch: ChannelFromRenderer, ...args: any[]) {
    ipc.send(ch, ...args);
}

export default function remoteActions(state: {} = null, action: Action) {
    switch (action.type) {
        default:
            break;
    }
    return state;
}
