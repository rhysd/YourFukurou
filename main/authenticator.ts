// TODO:
// This should be replaced with an implementation using <webview> in renderer process.
// Authentication should be done in renderer process because of multiple account.
// Authentication window should be rendered in main window.

import {readFile, writeFile} from 'fs';
import {join} from 'path';
import {BrowserWindow, app} from 'electron';
import log from './log';
import {OAuth} from 'oauth';

const config_path = join(app.getPath('userData'), 'tokens.json');

function authenticate_with_request_tokens(
        oauth: OAuth,
        request_token: string,
        request_token_secret: string): Promise<AccessToken> {
    'use strict';

    return new Promise((resolve, reject) => {
        let login_window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                webSecurity: true,
                nodeIntegration: false,
            },
        });

        login_window.webContents.on('will-navigate', (event: Event, url: string) => {
            event.preventDefault();

            const match = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/);
            if (!match) {
                return;
            }

            oauth.getOAuthAccessToken(request_token, request_token_secret, match[2], (err, token, token_secret) => {
                log.debug('access token: ' + token);

                if (err) {
                    setTimeout(() => login_window.close(), 0);
                    reject(err);
                    return;
                }

                const access = {
                    token,
                    token_secret,
                };

                resolve(access);

                writeFile(config_path, JSON.stringify(access), e => {
                    if (e) {
                        log.warn('Failed to store tokens to a token.json', e);
                    }
                    login_window.close();
                });
            });
        });

        login_window.on('closed', () => {
            login_window = null;
        });

        const login_url = `https://twitter.com/oauth/authenticate?oauth_token=${request_token}`;
        log.debug('Start authentication: ' + login_url);
        login_window.loadURL(login_url);
    });
}

export function authenticate(consumer_key: string, consumer_secret: string): Promise<AccessToken> {
    'use strict';

    return new Promise((resolve, reject) => {
        const oauth = new OAuth(
            'https://twitter.com/oauth/request_token',
            'https://twitter.com/oauth/access_token',
            consumer_key,
            consumer_secret,
            '1.0A',
            'https://example.com', // Note: Will not be used
            'HMAC-SHA1'
        );
        oauth.getOAuthRequestToken((err, token, token_secret) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(authenticate_with_request_tokens(oauth, token, token_secret));
        });
    });
}

export function load_cached_tokens(): Promise<AccessToken> {
    'use strict';

    if (process.env.YOURFUKUROU_ACCESS_TOKEN &&
        process.env.YOURFUKUROU_ACCESS_TOKEN_SECRET) {
        // TODO:
        // Verify tokens

        return Promise.resolve({
            token: process.env.YOURFUKUROU_ACCESS_TOKEN,
            token_secret: process.env.YOURFUKUROU_ACCESS_TOKEN_SECRET,
        });
    }

    return new Promise((resolve, reject) => {
        readFile(config_path, 'utf8', (err, str) => {
            if (err) {
                reject(err);
                return;
            }

            // TODO:
            // Verify tokens

            resolve(JSON.parse(str) as AccessToken);
        });
    });
}
