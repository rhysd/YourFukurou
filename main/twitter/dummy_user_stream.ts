import log from '../log';
import {Sender} from '../ipc';
import {readFile} from 'fs';
import {app} from 'electron';
import {join} from 'path';

export default class DummyUserStream {
    running: boolean;
    dummy_file_path: string;
    cache: Object[];

    constructor(
        private sender: Sender
    ) {
        this.running = false;
        this.dummy_file_path = join(process.env.YOURFUKUROU_FIXTURE_DIR || app.getPath('userData'), 'dummy_stream.json');
    }

    read() {
        return new Promise<Object[]>((resolve, reject) => {
            readFile(this.dummy_file_path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data) as Object[]);
            });
        });
    }

    connectToStream(params: Object = {}) {
        log.info('connectToStream:', params);
        this.running = true;

        log.debug('Starting to send dummy stream');
        this.read().then((tweets: Object[]) => {
            let idx = 0;

            const random_range =
                (min: number, max: number) => Math.random() * (max - min) + min;

            // Note:
            // const send_all = () => { ... raises a 'use variable before definition' error
            let send_all: () => void;
            send_all = () => {
                this.sender.send('yf:tweet', tweets[idx]);
                ++idx;
                if (idx < tweets.length && this.running) {
                    setTimeout(send_all, random_range(500, 5000));
                } else {
                    this.running = false;
                }
            };
            send_all();
        });
    }

    sendConnectionFailure() {
        this.sender.send('yf:connection-failure');
    }

    reconnectToStream(delay_ms: number = 3000, params: Object = {}) {
        log.info('recconectToStream:', delay_ms, params);
        return Promise.resolve();
    }

    stopStreaming() {
        this.running = false;
    }

    isStopped() {
        return !this.running;
    }
}

