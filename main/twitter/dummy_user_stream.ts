import * as Twit from 'twit';
import log from '../log';
import {Sender} from '../ipc';
import Fixture from './fixture';

export default class DummyUserStream {
    running: boolean;
    fixture: Fixture;

    constructor(
        private sender: Sender
    ) {
        this.running = false;
    }

    connectToStream(params: Object = {}) {
        log.info('connectToStream:', params);
        this.running = true;

        log.debug('Starting to send dummy stream');
        this.fixture.read('stream_tweets').then((tweets: Object[]) => {
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

