import Dexie from 'dexie';
import log from '../log';

export interface HashtagsScheme {
    text: string;
    timestamp: number;
}

export type HashtagsTable = Dexie.Table<HashtagsScheme, string>;

export default class Hashtags {
    static getScheme(version: number) {
        switch (version) {
            case 1:
                return '&text,timestamp';
            default:
                log.error('Invalid version number:', version);
                return null;
        }
    }

    constructor(private table: HashtagsTable) {
    }

    storeHashtag(text: string) {
        return this.table.put({
            text,
            timestamp: Date.now(),
        }).catch((e: Error) => {
            log.error('Error on storing hashtag:', text);
            throw e;
        });
    }

    storeHashtagsInTweet(json: TweetJson) {
        if (!json.entities || !json.entities.hashtags) {
            return;
        }
        for (const h of json.entities.hashtags) {
            this.storeHashtag(h.text);
        }
    }

    getAllHashtags() {
        return this.table.toArray().then(hs => hs.map(h => h.text))
            .catch((e: Error): HashtagsScheme[] => {
                log.error('Error on getting all hashtags:', e);
                throw e;
            });
    }

    dump() {
        return this.table.toArray()
            .then(arr => log.debug('HASHTAGS:', arr));
    }
}
