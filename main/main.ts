import {join} from 'path';
import {
    app,
    BrowserWindow,
    powerMonitor,
    globalShortcut,
    powerSaveBlocker,
} from 'electron';
import windowState = require('electron-window-state');
import * as Twit from 'twit';
import {authenticate, load_cached_tokens} from './authenticator';
import log from './log';
import * as Ipc from './ipc';
import TwitterUserStream from './twitter/user_stream';
import DummyUserStream from './twitter/dummy_user_stream';
import setApplicationMenu from './menu';
import loadConfig from './config';

let win = null as (Electron.BrowserWindow | null);

const already_running = app.makeSingleInstance(() => {
    if (!win) {
        return;
    }

    if (win.isMinimized()) {
        win.restore();
    }

    win.focus();
});

if (already_running) {
    app.quit();
}

const consumer_key = process.env.YOURFUKUROU_CONSUMER_KEY || 'H4fJ2rgNuH2UiOXuPBjHpl9zL';
const consumer_secret = process.env.YOURFUKUROU_CONSUMER_KEY_SECRET || 'azYRjJn6emdsOIUhepy0Wygmaq9PltEnpsx4P4BfU1HMp5Unmm';
const should_use_dummy_data = !!process.env.YOURFUKUROU_USE_FIXTURE;

const load_config_and_authenticate = loadConfig()
        .then(c => {
            global.config_path = c[0];
            global.config = c[1];
            if (global.config.proxy) {
                process.env.http_proxy = `http://${global.config.proxy}`;
                process.env.https_proxy = `https://${global.config.proxy}`;
            }
        })
        .catch(e => {
            log.error('Fatal error on loading configuration:', e);
            app.quit();
        })
        .then(load_cached_tokens)
        .catch(_ => authenticate(consumer_key, consumer_secret));

app.once('window-all-closed', () => app.quit());

function isRunFromNpmPackageOnDarwin() {
    return process.platform === 'darwin' && app.getAppPath().indexOf('/YourFukurou.app/') === -1;
}

function setupHotkey() {
    const hotkey = global.config!.hotkey_accelerator;
    if (hotkey) {
        globalShortcut.register(hotkey, () => win && (win.isFocused() ? win.hide() : win.show()));
        log.debug('Hot key was set:' + hotkey);
    }
}

function resumeStreamOnPowerOn(stream: TwitterUserStream | DummyUserStream) {
    powerMonitor.on('suspend', () => {
        log.debug("PC's going to suspend, stop streaming");
        stream.stopStreaming();
    });
    powerMonitor.on('resume', () => {
        log.debug("PC's resuming, will reconnect after 3secs: " + stream.isStopped());
        if (stream.isStopped()) {
            stream.sendConnectionFailure();
            stream.connectToStream();
        }
    });
}

function startApp(access: AccessToken) {

    if (!access.token || !access.token_secret) {
        log.error('Failed to get access tokens');
        return;
    }

    if (!win) {
        log.error('Window does not exist');
        return;
    }

    log.debug('dom-ready: Ready to connect to Twitter API');

    const options = {
        consumer_key,
        consumer_secret,
        access_token: access.token,
        access_token_secret: access.token_secret,
    };
    const twit = new Twit(options);
    const sender = new Ipc.Sender(win.webContents);
    const subscriber = new Ipc.Subscriber();

    subscriber.subscribe('yf:start-user-stream', () => {
        const stream = should_use_dummy_data ?
            new DummyUserStream(sender) : new TwitterUserStream(sender, twit);
        stream.connectToStream();
        resumeStreamOnPowerOn(stream);
    });

    sender.send('yf:auth-tokens', options);
}

function openWindow(access: AccessToken) {
    return new Promise<AccessToken>(resolve => {
        log.debug('Starting to open window');

        const win_state = windowState({
            defaultWidth: 600,
            defaultHeight: 800,
        });

        const index_html = 'file://' + join(__dirname, '..', 'index.html');
        const icon_path = join(__dirname, '..', 'images', 'icon.png');
        win = new BrowserWindow({
            x: win_state.x,
            y: win_state.y,
            width: win_state.width,
            height: win_state.height,
            titleBarStyle: 'hidden-inset',
            autoHideMenuBar: true,
            icon: icon_path,
        });

        win.once('closed', () => { win = null; });

        if (win_state.isFullScreen) {
            win.setFullScreen(true);
        } else if (win_state.isMaximized) {
            win.maximize();
        }
        win_state.manage(win);

        win.webContents.on('dom-ready', () => {
            setupHotkey();
            resolve(access);
        });

        win.loadURL(index_html);

        if (isRunFromNpmPackageOnDarwin()) {
            app.dock.setIcon(icon_path);
        }

        setApplicationMenu();

        if (process.env.NODE_ENV === 'development') {
            win.webContents.on('devtools-opened', () => setImmediate(() => win && win.focus()));
            win.webContents.openDevTools({mode: 'detach'});
        }

        if (!!global.config!.sticky_window) {
            if (!win) {
                log.error('Window is already destroyed!');
                return;
            }
            log.debug('Sticky mode: On');
            win.setVisibleOnAllWorkspaces(true);
            win.on('blur', () => {
                if (win && !win.isFullScreen() && !win.webContents.isDevToolsFocused()) {
                    win.hide();
                }
            });
        }

        if (!!global.config!.caffeinated) {
            log.debug('Caffeinated: App suspension will be blocked.');
            powerSaveBlocker.start('prevent-app-suspension');
        }
    });
}

app.once(
    'ready',
    () => load_config_and_authenticate
        .then(openWindow)
        .then(startApp)
        .catch(e => log.error('Unexpected error on "ready" callback:', e)),
);

app.on('activate', () => {
    if (win) {
        win.show();
    }
});
