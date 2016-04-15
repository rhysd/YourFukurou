import {join} from 'path';
import {app, BrowserWindow, powerMonitor} from 'electron';
import {authenticate, load_cached_tokens} from './authenticator';
import log from './log';
import IpcSender from './ipc_sender';
import Twitter from './twitter';

const load_cache = load_cached_tokens();
const consumer_key = process.env.YOURFUKUROU_CONSUMER_KEY || 'H4fJ2rgNuH2UiOXuPBjHpl9zL';
const consumer_secret = process.env.YOURFUKUROU_CONSUMER_KEY_SECRET || 'azYRjJn6emdsOIUhepy0Wygmaq9PltEnpsx4P4BfU1HMp5Unmm';

app.once('window-all-closed', () => app.quit());

function isRunFromNpmPackageOnDarwin() {
    'use strict';
    return process.platform === 'darwin' && app.getAppPath().indexOf('/YourFukurou.app/') === -1;
}

function open_window(access: AccessToken) {
    'use strict';
    log.debug('Starting to open window');

    const index_html = 'file://' + join(__dirname, '..', 'index.html');
    const icon_path = join(__dirname, '..', 'images', 'icon.png');
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hidden-inset',
        icon: icon_path,
    });

    win.once('closed', () => { win = null; });

    if (access.token && access.token_secret) {
        win.webContents.on('dom-ready', () => {
            log.debug('dom-ready: Ready to connect to Twitter API');
            const twitter = new Twitter();
            twitter.prepareClient({
                consumer_key,
                consumer_secret,
                access_token_key: access.token,
                access_token_secret: access.token_secret,
            });
            const sender = new IpcSender(win.webContents);

            powerMonitor.on('suspend', () => {
                log.debug("PC's going to suspend, stop streaming");
                twitter.stopStreaming();
            });
            powerMonitor.on('resume', () => {
                log.debug("PC's resuming, will reconnect after 3secs: " + twitter.isStopped());
                if (twitter.isStopped()) {
                    setTimeout(() => twitter.fetchStreaming().catch(e => log.error(e)), 3000);
                }
            });

            twitter.startStreaming(sender).catch(e => log.error(e));
        });
    } else {
        log.error('Failed to get access tokens');
    }

    win.loadURL(index_html);

    if (isRunFromNpmPackageOnDarwin()) {
        app.dock.setIcon(icon_path);
    }

    if (process.env.NODE_ENV === 'development') {
        win.webContents.on('devtools-opened', () => setImmediate(() => win.focus()));
        win.webContents.openDevTools({detach: true});
    }
}

app.once(
    'ready',
    () => load_cache
        .catch(_ => authenticate(consumer_key, consumer_secret))
        .then(open_window)
        .catch(e => log.error(e))
);


