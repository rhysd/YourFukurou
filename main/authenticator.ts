// TODO:
// This should be replaced with an implementation using <webview> in renderer process.
// Authentication should be done in renderer process because of multiple account.
// Authentication window should be rendered in main window.

import {readFile, writeFile} from 'fs';
import {join} from 'path';
import {BrowserWindow, app} from 'electron';
import * as API from 'node-twitter-api';
import log from './log';

const config_path = join(app.getPath('userData'), 'tokens.json');

function authenticate_with_request_tokens(
        api: TwitterAPI.Authenticator,
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

            api.getAccessToken(request_token, request_token_secret, match[2], (err, access_token, access_token_secret) => {
                log.debug('access token: ' + access_token);

                if (err) {
                    setTimeout(() => login_window.close(), 0);
                    reject(err);
                    return;
                }

                const access = {
                    token: access_token,
                    token_secret: access_token_secret,
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

        const login_url = api.getAuthUrl(request_token);
        log.debug('Start authentication: ' + login_url);
        login_window.loadURL(login_url);
    });
}

export function authenticate(consumer_key: string, consumer_secret: string): Promise<AccessToken> {
    'use strict';

    return new Promise((resolve, reject) => {
        const api = new API({
            consumerKey: consumer_key,
            consumerSecret: consumer_secret,
            callback: 'https://example.com',
        });

        api.getRequestToken((err, request_token, request_token_secret) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(authenticate_with_request_tokens(api, request_token, request_token_secret));
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
