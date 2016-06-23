import {join} from 'path';
import log from '../log';

const {readFile} = global.require('fs');
const {app} = global.require('electron');

export default class Fixture {
    fixture_dir: string;
    read_one_file: Promise<any>;

    constructor() {
        this.fixture_dir = global.process.env.YOURFUKUROU_FIXTURE_DIR || app.getPath('userData');
        this.read_one_file = this.readJson<any>('dummy.json');
    }

    fallbackToOneJsonFile<T>(kind: string) {
        return this.read_one_file
            .then(json => {
                if (!json[kind]) {
                    throw new Error(`Key '${kind}' is not found in ${this.fixture_dir}/dummy.json`);
                }
                return json[kind] as T;
            });
    }

    read<T>(kind: string) {
        return this.readJson<T>(`dummy_${kind}.json`)
            .catch(() => this.fallbackToOneJsonFile<T>(kind))
            .catch((e: Error): any => {
                const msg = `'${kind}' is wrong key.\nPlease check ${this.fixture_dir}/dummy.json or ${this.fixture_dir}/dummy_${kind}.json.\n${e.message}`;
                log.error(msg);
                throw new Error(msg);
            });
    }

    private readJson<T>(file: string) {
        const json_path = join(this.fixture_dir, file);
        return new Promise<T>((resolve, reject) => {
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
