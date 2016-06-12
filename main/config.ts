import * as path from 'path';
import {app} from 'electron';
import * as fs from 'fs';
import log from './log';

export const DefaultConfig = {
    notification: true,
    notification_sound: true,
    hotkey_accelerator: null,
    expand_tweet: 'always',
    plugin: [],
    mute: {
        home: true,
        mention: false,
    },
    max_timeline_items: null,
    proxy: null,
    sticky_window: false,
} as Config;

export default function loadConfig() {
    'use strict';
    return new Promise<[string, Config]>((resolve, reject) => {
        const config_path =
            process.env.YOURFUKUROU_CONFIG_JSON_PATH ||
            path.join(app.getPath('userData'), 'config.json');

        fs.readFile(config_path, 'utf8', (err, content) => {
            if (err) {
                log.debug(`Error on reading config file: ${err.message}.  Create default config file to ${config_path}`);
                try {
                    fs.writeFileSync(config_path, JSON.stringify(DefaultConfig, null, 2));
                } catch (e) {
                    reject(e);
                }
                return resolve([
                    config_path,
                    DefaultConfig,
                ]);
            }

            resolve([
                config_path,
                Object.assign({}, DefaultConfig, JSON.parse(content)) as Config,
            ]);
        });
    });
}
