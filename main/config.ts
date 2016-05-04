import * as path from 'path';
import {app} from 'electron';
import * as fs from 'fs';
import assign = require('object-assign');
import log from './log';

export const DefaultConfig = {
    notification: true,
    plugin: [],
} as Config;

export default function loadConfig() {
    return new Promise<[string, Config]>((resolve, reject) => {
        const config_path = path.join(app.getPath('userData'), 'config.json');

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
                assign({}, DefaultConfig, JSON.parse(content)) as Config,
            ]);
        });
    });
}
