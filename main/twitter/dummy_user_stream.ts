import {readFile} from 'fs';
import {join} from 'path';
import {app} from 'electron';
import * as Twit from 'twit';
import log from '../log';
import {Sender} from '../ipc';

export default class DummyUserStream {
    running: boolean;

    constructor(
        private sender: Sender
    ) {
        this.running = false;
    }

    connectToStream(params: Object = {}) {
        log.info('connectToStream:', params);
        this.running = true;

        log.debug('Starting to send dummy stream');
        const dummy_json_path = join(app.getPath('userData'), 'tweets.json');
        readFile(dummy_json_path, 'utf8', (err, data) => {
            if (err) {
                log.error('File not found:', dummy_json_path);
                return;
            }
            const tweets = JSON.parse(data) as Object[];
            let idx = 0;

            const random_range =
                (min: number, max: number) => Math.random() * (max - min) + min;

            const send_all = () => {
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

