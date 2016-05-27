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

    captureScreenShot(dir?: string) {
        this.browserWindow.capturePage((img: any) => {
            writeFileSync(join(dir || '.', 'screenshot.png'), img.toPng());
        });
    }
}
