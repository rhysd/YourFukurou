import {join} from 'path';
import {writeFileSync} from 'fs';
import {Application} from 'spectron';
import * as electron from 'electron-prebuilt';

const app_path = join(__dirname, '..', '..');

export function createApp() {
    return new Application({
        path: electron,
        args: [app_path],
        env: process.env,
    });
};

export function captureScreenShot(app: Application, path_name: string) {
    app.browserWindow.capturePage((img: any) => {
        writeFileSync('screenshot.png', img.toPng());
    });
}

process.on('unhandledRejection', (err: Error) => {
    console.error(err);
    throw err;
});
