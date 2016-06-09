import {readFile} from 'fs';
import {app} from 'electron';
import {join} from 'path';
import log from '../log';

export default class Fixture {
    fixture_dir: string;
    read_one_file: Promise<any>;

    constructor() {
        this.fixture_dir = process.env.YOURFUKUROU_FIXTURE_DIR || app.getPath('userData');
        this.read_one_file = this.readJson('dummy.json');
    }

    fallbackToOneJsonFile(kind: string) {
        return this.read_one_file
            .then(json => {
                if (!json[kind]) {
                    throw new Error(`Key '${kind}' is not found in ${this.fixture_dir}/dummy.json`);
                }
                return json[kind];
            });
    }

    read(kind: string) {
        return this.readJson(`dummy_${kind}.json`)
            .catch(() => this.fallbackToOneJsonFile(kind))
            .catch((e: Error): any => {
                const msg = `'${kind}' is wrong key.\nPlease check ${this.fixture_dir}/dummy.json or ${this.fixture_dir}/dummy_${kind}.json.\n${e.message}`;
                log.error(msg);
                throw new Error(msg);
            });
    }

    private readJson(file: string) {
        const json_path = join(this.fixture_dir, file);
        return new Promise<any>((resolve, reject) => {
            readFile(json_path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(data));
            });
        });
    }
}
