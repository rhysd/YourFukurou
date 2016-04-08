import {join} from 'path';
import {app, BrowserWindow} from 'electron';
import {authenticate, load_cached_tokens} from './authenticator';
import log from './log';

const load_cache = load_cached_tokens();

app.once('window-all-closed', () => app.quit());

function open_window(tokens: AccessToken) {
    'use strict';

    const index_html = 'file://' + join(__dirname, '..', 'index.html');
    let win = new BrowserWindow({
        width: 800,
        height: 600,
    });

    win.once('closed', () => { win = null; });

    win.loadURL(index_html);

    if (process.env.NODE_ENV === 'development') {
        win.webContents.on('devtools-opened', () => setImmediate(() => win.focus()));
        win.webContents.openDevTools({detach: true});
    }
}

app.once(
    'ready',
    () => load_cache
        .catch(_ => authenticate('H4fJ2rgNuH2UiOXuPBjHpl9zL', 'azYRjJn6emdsOIUhepy0Wygmaq9PltEnpsx4P4BfU1HMp5Unmm'))
        .then(open_window)
        .catch(e => log.error(e))
);


