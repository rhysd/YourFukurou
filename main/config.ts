import * as path from 'path';
import {app} from 'electron';
import * as fs from 'fs';
import assign = require('object-assign');
import log from './log';

export const DefaultConfig = {
    notification: true,
    plugin: [],
} as Config;

export const ConfigPath = path.join(app.getPath('userData'), 'config.json');

export default function loadConfig() {
    return new Promise<Config>((resolve, reject) => {
        fs.readFile(ConfigPath, 'utf8', (err, content) => {
            if (err) {
                log.debug(`Error on reading config file: ${err.message}.  Create default config file to ${ConfigPath}`);
                try {
                    fs.writeFileSync(ConfigPath, JSON.stringify(DefaultConfig, null, 2));
                } catch (e) {
                    reject(e);
                }
                return resolve(DefaultConfig);
            }

            resolve(
                assign({}, DefaultConfig, JSON.parse(content)) as Config
            );
        });
    });
}
