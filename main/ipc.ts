import {BrowserWindow} from 'electron';
import log from './log';
import {ipcMain as ipc} from 'electron';

export class Sender {
    constructor(
        public sender: Electron.WebContents = BrowserWindow.getFocusedWindow().webContents
    ) {}

    send(channel: ChannelFromMain, ...args: any[]) {
        log.debug('---> Channel:', channel);
        this.sender.send(channel, ...args);
    }
}

export class Subscriber {
    listeners: Map<ChannelFromRenderer, Electron.IpcMainEventListener>;

    constructor() {
        this.listeners = new Map<ChannelFromRenderer, Electron.IpcMainEventListener>();
    }

    subscribe(c: ChannelFromRenderer, cb: Function) {
        const listener = (_: Electron.IpcMainEvent, ...args: any[]) => {
            log.debug('<--- Channel:', c);
            cb.apply(this, args);
        };

        ipc.on(c, listener);
        this.listeners.set(c, listener);
    }

    unsubscribeAll() {
        this.listeners.forEach((listener, channel) => {
            ipc.removeListener(channel, listener);
        });
    }
}
