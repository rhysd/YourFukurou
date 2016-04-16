import {BrowserWindow} from 'electron';
import log from './log';

export default class IpcSender {
    constructor(
        public sender: Electron.WebContents = BrowserWindow.getFocusedWindow().webContents
    ) {}

    send(channel: ChannelFromMain, ...args: any[]) {
        log.debug('Send to channel: ' + channel);
        this.sender.send(channel, ...args);
    }
}
