import {join} from 'path';
import {app, BrowserWindow, powerMonitor, globalShortcut} from 'electron';
import windowState = require('electron-window-state');
import * as Twit from 'twit';
import {authenticate, load_cached_tokens} from './authenticator';
import log from './log';
import * as Ipc from './ipc';
import TwitterRestAPI from './twitter/rest';
import TwitterUserStream from './twitter/user_stream';
import setApplicationMenu from './menu';
import loadConfig from './config';

let win = null as Electron.BrowserWindow;

const already_running = app.makeSingleInstance((cmdline, working_dir) => {
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
const should_use_dummy_data = process.env.NODE_ENV === 'development' && process.env.YOURFUKUROU_DUMMY_TWEETS;

const prepare_app = loadConfig()
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
    'use strict';
    return process.platform === 'darwin' && app.getAppPath().indexOf('/YourFukurou.app/') === -1;
}

function setupHotkey() {
    'use strict';
    if (global.config.hotkey_accelerator) {
        const hotkey = global.config.hotkey_accelerator;
        globalShortcut.register(hotkey, () => win.isFocused() ? win.hide() : win.show());
        log.debug('Hot key was set:' + hotkey);
    }
}

function resumeStreamOnPowerOn(stream: TwitterUserStream) {
    'use strict';
    powerMonitor.on('suspend', () => {
        log.debug("PC's going to suspend, stop streaming");
        if (!should_use_dummy_data) {
            stream.stopStreaming();
        }
    });
    powerMonitor.on('resume', () => {
        log.debug("PC's resuming, will reconnect after 3secs: " + stream.isStopped());
        if (stream.isStopped() && !should_use_dummy_data) {
            stream.sendConnectionFailure();
            stream.connectToStream();
        }
    });
}

// XXX: 'access' is actually not necessarry
function setupDummyStream(access: AccessToken) {
    'use strict';

    const twit = new Twit({
        consumer_key,
        consumer_secret,
        access_token: access.token,
        access_token_secret: access.token_secret,
    });
    const sender = new Ipc.Sender(win.webContents);
    const rest = new TwitterRestAPI(sender, twit);
    const stream = new TwitterUserStream(sender, twit);

    return rest.sendDummyAccount()
        .then(() => stream.sendDummyStream())
        .catch(e => log.error('Unexpected error on dummy stream:', e));
}

function startApp([access]: [AccessToken]) {
    'use strict';

    if (!access.token || !access.token_secret) {
        log.error('Failed to get access tokens');
        return;
    }

    log.debug('dom-ready: Ready to connect to Twitter API');

    if (should_use_dummy_data) {
        return setupDummyStream(access);
    }

    let twit: Twit
      , sender: Ipc.Sender
      , rest: TwitterRestAPI;

    function verifyAccount() {
        'use strict';
        twit = new Twit({
            consumer_key,
            consumer_secret,
            access_token: access.token,
            access_token_secret: access.token_secret,
        });
        sender = new Ipc.Sender(win.webContents);
        rest = new TwitterRestAPI(sender, twit);

        return rest.sendAuthenticatedAccount();
    }

    verifyAccount()
        .catch(err => {
            if (!err || (err instanceof Error) || err[0].code !== 32) {
                log.error('Unexpected error on verifying account:', err);
                app.quit();
            }

            log.debug('Account verification failed.  Retry authentication flow');

            return authenticate(consumer_key, consumer_secret)
                .then(verifyAccount);
        })
        .then(() => Promise.all([
            rest.fetchMuteIds(),
            rest.fetchNoRetweets(),
            rest.fetchBlockIds(),
            rest.fetchHomeTimeline({
                include_entities: true,
                count: global.config.expand_tweet === 'always' ? 20 : 40,
            }),
            rest.fetchMentionTimeline(),
        ]))
        .then(([mute_ids, no_retweet_ids, block_ids, tweets, mentions]) => {
            // Note: Merge mute list with block list
            for (const m of mute_ids) {
                if (block_ids.indexOf(m) === -1) {
                    block_ids.push(m);
                }
            }
            log.debug('Total rejected ids: ', block_ids.length);
            sender.send('yf:rejected-ids', block_ids);
            sender.send('yf:no-retweet-ids', no_retweet_ids);
            for (const tw of tweets) {
                sender.send('yf:tweet', tw);
            }
            sender.send('yf:mentions', mentions);
        })
        .then(() => {
            const stream = new TwitterUserStream(sender, twit);
            stream.connectToStream();
            resumeStreamOnPowerOn(stream);
        });
}

function openWindow() {
    'use strict';
    return new Promise<AccessToken>((resolve, reject) => {
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
            resolve();
        });

        win.loadURL(index_html);

        if (isRunFromNpmPackageOnDarwin()) {
            app.dock.setIcon(icon_path);
        }

        setApplicationMenu(win);

        if (process.env.NODE_ENV === 'development') {
            win.webContents.on('devtools-opened', () => setImmediate(() => win.focus()));
            win.webContents.openDevTools({mode: 'detach'});
        }
    });
}

app.once(
    'ready',
    () => Promise.all([
            prepare_app,
            openWindow(),
        ])
        .then(startApp)
        .catch(e => log.error('Unexpected error on "ready" callback:', e))
);

