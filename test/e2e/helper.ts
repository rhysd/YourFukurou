import {join} from 'path';
import {Application} from 'spectron';
import * as electron from 'electron-prebuilt';

const app_path = join(__dirname, '..', '..');

export function createApp() {
    return new Application({
        path: electron,
        args: [app_path],
    });
};

process.on('unhandledRejection', (err: Error) => {
    console.error(err);
    throw err;
});
