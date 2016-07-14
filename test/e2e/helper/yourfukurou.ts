import {join} from 'path';
import {writeFileSync} from 'fs';
import {Application} from 'spectron';
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

    async getRendererProcessLogs() {
        const logs = await this.client.getRenderProcessLogs();
        return logs.map(l => `[${l.level}]: ${l.message}`);
    }

    async getMainProcessLogs() {
        return this.client.getMainProcessLogs();
    }

    async getLogsJson() {
        const rl = await this.getRendererProcessLogs();
        const ml = await this.getMainProcessLogs();
        const obj = {
            main: ml,
            renderer: rl,
        };
        return JSON.stringify(obj, null, 2);
    }

    async dumpLogsTo(file_name: string, dir?: string) {
        const json = await this.getLogsJson();
        writeFileSync(join(dir || '.', file_name), json, 'utf8');
    }
}
