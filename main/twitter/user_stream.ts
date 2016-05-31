import {readFile} from 'fs';
import {join} from 'path';
import {app} from 'electron';
import * as Twit from 'twit';
import log from '../log';
import {Sender} from '../ipc';

export default class TwitterUserStream {
    private stream: Twit.Stream;

    constructor(
        private sender: Sender,
        public client: Twit
    ) {
        this.stream = null;
    }

    connectToStream(params: Object = {}) {
        if (this.stream !== null) {
            this.stopStreaming();
        }
        this.stream = this.client.stream('user', params);

        this.stream.on('friends', msg => {
            log.debug('FRIENDS: length: ', msg.friends.length);
            this.sender.send('yf:friends', msg.friends);
        });

        this.stream.on('tweet', tw => {
            log.debug(`TWEET: @${tw.user.screen_name}: ${tw.text}`);
            this.sender.send('yf:tweet', tw);
        });

        this.stream.on('delete', e => {
            log.debug('DELETE: status: ', e.delete.status);
            this.sender.send('yf:delete-status', e.delete.status);
        });

        this.stream.on('reconnect', () => {
            log.debug('RECONNECT: Stream was disconnected unexpectedly.  Try to reconnect.');
        });

        this.stream.on('user_event', e => {
            log.debug(`${e.event.toUpperCase()}: From: @${e.source.screen_name}, To: @${e.target.screen_name}: `, e.target_object);
        });

        this.stream.on('follow', e => {
            this.sender.send('yf:follow', e.source, e.target);
        });

        this.stream.on('unfollow', e => {
            // Note: source is always me.
            this.sender.send('yf:unfollow', e.target);
        });

        this.stream.on('unknown_user_event', msg => {
            switch (msg.event) {
                case 'mute':
                    this.sender.send('yf:rejected-ids', [msg.target.id]);
                    break;
                case 'unmute':
                    this.sender.send('yf:unrejected-ids', [msg.target.id]);
                    break;
                case 'access_revoked':
                    // TODO:
                    break;
                default:
                    break;
            }
        });

        this.stream.on('limit', () => {
            this.sender.send('yf:api-failure', 'API limit have reached');
        });

        this.stream.on('disconnect', event => {
            log.debug('DISCONNECT:', event.disconnect);
            this.sender.send('yf:api-failure', 'Stream was disconnected: ' + event.disconnect.reason);
        });

        this.stream.on('direct_message', dm => {
            log.debug('DIRECT_MESSAGE:', dm);
        });

        this.stream.on('user_update', msg => {
            this.sender.send('yf:my-account-update', msg.target);
        });

        this.stream.on('favorite', msg => {
            // Note: msg.target is not used renderer process.  So I don't send it here.
            this.sender.send('yf:liked-status', msg.target_object, msg.source);
        });

        // Note:
        // I don't handle 'unfavorite' because it's already handled by responses of
        // 'favorites/create' and 'favorites/destroy'.

        // Note: Should watch more events
        //
        // this.stream.on('favorite')
        // this.stream.on('unfavorite')
        // this.stream.on('blocked')
        // this.stream.on('unblocked')
        // this.stream.on('follow')
        // this.stream.on('unfollow')
        // ...

        this.stream.on('error', err => {
            log.error('Error occurred on stream, will reconnect: ', err);
            this.sender.send('yf:api-failure', err.message);
        });
    }

    sendConnectionFailure() {
        this.sender.send('yf:connection-failure');
    }

    reconnectToStream(delay_ms: number = 3000, params: Object = {}) {
        return new Promise<void>(resolve => {
            this.sendConnectionFailure();
            setTimeout(delay_ms, () => {
                this.connectToStream(params);
                resolve();
            });
        });
    }

    // TODO:
    // Should separate DummyUserStream from TwitterUserStream
    sendDummyStream() {
        log.debug('Starting to send dummy stream');
        const dummy_json_path = join(app.getPath('userData'), 'tweets.json');
        return new Promise<void>((resolve, reject) => {
            readFile(dummy_json_path, 'utf8', (err, data) => {
                if (err) {
                    log.error('File not found:', dummy_json_path);
                    reject();
                    return;
                }
                const tweets = JSON.parse(data) as Object[];
                let idx = 0;

                const random_range =
                    (min: number, max: number) => Math.random() * (max - min) + min;

                const send_all = () => {
                    this.sender.send('yf:tweet', tweets[idx]);
                    ++idx;
                    if (idx < tweets.length) {
                        setTimeout(send_all, random_range(500, 5000));
                    }
                };

                send_all();
                resolve();
            });
        });
    }

    stopStreaming() {
        if (this.stream === null) {
            log.debug('Stream already stopped');
            return;
        }
        this.stream.removeAllListeners('data');
        this.stream.removeAllListeners('error');
        this.stream.removeAllListeners('end');
        this.stream.stop();
        log.debug('Stream disconnected');
        this.stream = null;
    }

    isStopped() {
        return this.stream === null;
    }
}
