import * as Twit from 'twit';
import {IncomingMessage} from 'http';
import {join} from 'path';
import log from '../log';
import {showMessage} from '../actions/message';
import Store from '../store';

const {app} = global.require('electron');
const {readFile} = global.require('fs');

export interface UnderlyingClient {
    setupClient(options: Twit.Options): void;
    post<T>(name: string, params?: Object): Promise<T>;
    get<T>(name: string, params?: Object): Promise<T>;
}

export class TwitClient implements UnderlyingClient {
    private client: Twit | null;

    constructor() {
        this.client = null;
    }

    setupClient(options: Twit.Options) {
        this.client = new Twit(options);
    }

    showApiFailure(name: string, err: Error, res: IncomingMessage) {
        log.error('API failure: ', name, err, res);
        Store.dispatch(showMessage(err.message, 'error'));
    }

    post<T>(name: string, params: Object = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this.client === null) {
                log.error('Client is not set up yet');
                return;
            }
            this.client.post(name, params, (err, data, res) => {
                if (err) {
                    this.showApiFailure(name, err, res);
                    reject(err);
                    return;
                }
                log.debug('POST:', name, params, data);
                resolve(data);
            });
        });
    }

    get<T>(name: string, params: Object = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (this.client === null) {
                log.error('Client is not set up yet');
                return;
            }
            this.client.get(name, params, (err, data, res) => {
                if (err) {
                    this.showApiFailure(name, err, res);
                    reject(err);
                    return;
                }
                log.debug('GET:', name, params, data);
                resolve(data);
            });
        });
    }
}

export class DummyClient implements UnderlyingClient {
    fixture_dir: string;
    fixture_data: Promise<any>;

    constructor() {
        this.fixture_dir = global.process.env.YOURFUKUROU_FIXTURE_DIR || app.getPath('userData');
        this.fixture_data = this.readJson('dummy_rest_responses.json');
    }

    setupClient(_: any) {
        // Nothing to do for setup
    }

    post<T>(name: string, params: Object = {}): Promise<T> {
        return this.from_json<T>('POST:', name, params);
    }

    get<T>(name: string, params: Object = {}): Promise<T> {
        return this.from_json<T>('GET:', name, params);
    }

    private from_json<T>(method: string, name: string, _: Object = {}): Promise<T> {
        return this.fixture_data.then(data => {
            const res = data[name];
            if (!res) {
                throw new Error(`Dummy data for '${name}' is not found.`);
            }
            log.debug(method, name, res);
            return res as T;
        });
    }

    private readJson(file: string) {
        const json_path = join(this.fixture_dir, file);
        return new Promise<any>((resolve, reject) => {
            readFile(json_path, 'utf8', (err: Error, data: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data));
            });
        });
    }
}
