import * as Twit from 'twit';
import {IncomingMessage} from 'http';
import {join} from 'path';
import log from '../log';

const {app} = global.require('electron');
const {readFile} = global.require('fs');

export interface UnderlyingClient {
    setCredentials(options: Twit.Options): void;
    post<T>(name: string, params?: Object): Promise<T>;
    get<T>(name: string, params?: Object): Promise<T>;
}

export class TwitClient implements UnderlyingClient {
    private client: Twit;

    constructor() {
        this.client = null;
    }

    setCredentials(options: Twit.Options) {
        this.client = new Twit(options);
    }

    showApiFailure(name: string, err: Error, res: IncomingMessage) {
        log.error('API failure: ', name, err, res);
        // TODO:
        // Show message using <Message>
    }

    post<T>(name: string, params: Object = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.post(name, params, (err, data, res) => {
                if (err) {
                    this.showApiFailure(name, err, res);
                    reject(err);
                    return;
                }
                log.debug('POST:', name, data);
                resolve(data);
            });
        });
    }

    get<T>(name: string, params: Object = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.client.get(name, params, (err, data, res) => {
                if (err) {
                    this.showApiFailure(name, err, res);
                    reject(err);
                    return;
                }
                log.debug('GET:', name, data);
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
        this.fixture_data = this.readJson('dummy.json');
    }

    setCredentials(_: any) {
        // Nothing to do for setup
    }

    post<T>(name: string, params: Object = {}): Promise<T> {
        return this.from_json<T>('POST:', name, params);
    }

    get<T>(name: string, params: Object = {}): Promise<T> {
        return this.from_json<T>('GET:', name, params);
    }

    private from_json<T>(method: string, name: string, params: Object = {}): Promise<T> {
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
