import Dexie from 'dexie';
import {Twitter} from 'twit';
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

    storeHashtagsInTweet(json: Twitter.Status) {
        if (!json.entities || !json.entities.hashtags) {
            return;
        }

        const hashtags = json.entities.hashtags
            .map(h => ({
                text: h.text,
                timestamp: Date.now(),
            }));

        return this.table.bulkPut(hashtags)
            .catch((e: Error) => {
                log.error('Error on storing hashtag in tweet:', e, hashtags, json);
                throw e;
            });
    }

    storeHashtagsInTweets(jsons: Twitter.Status[]) {
        const entries = [] as HashtagsScheme[];
        const push = Array.prototype.push;

        for (const j of jsons) {
            if (!j.entities || !j.entities.hashtags) {
                continue;
            }

            const hashtags = j.entities.hashtags
                .map(h => ({
                    text: h.text,
                    timestamp: Date.now(),
                }));

            push.apply(entries, hashtags);
        }

        if (entries.length === 0) {
            return Dexie.Promise.resolve<void>();
        }

        return this.table.bulkPut(entries)
            .catch((e: Error) => {
                log.error('Error on storing hashtags in tweets:', e, entries);
                throw e;
            });
    }

    getAllHashtags() {
        return this.table.toArray().then(hs => hs.map(h => h.text))
            .catch((e: Error): HashtagsScheme[] => {
                log.error('Error on getting all hashtags:', e);
                throw e;
            });
    }

    getHashtagsByScreenNameStartsWith(str: string, limit?: number) {
        const query = limit ?
            this.table.where('text').startsWith(str).limit(limit) :
            this.table.where('text').startsWith(str);

        return query.toArray()
            .then(hs => hs.map(h => h.text))
            .catch((e: Error): string[] => {
                log.error(`Error on getting accounts which start with ${str}:`, e);
                throw e;
            });
    }


    dump() {
        return this.table.toArray()
            .then(arr => log.debug('HASHTAGS:', arr));
    }
}
