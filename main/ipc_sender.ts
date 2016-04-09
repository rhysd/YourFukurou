import {BrowserWindow} from 'electron';

export default class IpcSender {
    constructor(
        public sender: Electron.WebContents = BrowserWindow.getFocusedWindow().webContents
    ) {}

    send(channel: Channel, ...args: any[]) {
        this.sender.send(channel, ...args);
    }
}
