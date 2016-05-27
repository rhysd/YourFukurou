import {join} from 'path';
import {writeFileSync} from 'fs';
import {Application, ApplicationOptions} from 'spectron';
import * as electron from 'electron-prebuilt';

export default class YourFukurou extends Application {
    constructor(config_path?: string) {
        super({
            path: electron,
            args: [join(__dirname, '..', '..', '..')],
            env: Object.assign({}, process.env, {
                YOURFUKUROU_CONFIG_JSON_PATH: config_path || './config.json',
            }),
        });
    }

    captureScreenShot(name: string, dir?: string) {
        this.browserWindow.capturePage().then((img: Buffer) => {
            writeFileSync(join(dir || '.', name), img);
        });
    }
}
