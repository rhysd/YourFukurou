import {BrowserWindow} from 'electron';
import log from './log';

export default class IpcSender {
    constructor(
        public sender: Electron.WebContents = BrowserWindow.getFocusedWindow().webContents
    ) {}

    send(channel: ChannelFromMain, ...args: any[]) {
        log.debug('---> Channel:', channel);
        this.sender.send(channel, ...args);
    }
}
