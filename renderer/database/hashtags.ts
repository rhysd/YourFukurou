import Dexie from 'dexie';
import {Twitter} from 'twit';
import log from '../log';

export interface HashtagsScheme {
    text: string;
    timestamp: number;
    completion_count: number;
}

export type HashtagsTable = Dexie.Table<HashtagsScheme, string>;

function textToEntry(text: string): HashtagsScheme {
    'use strict';
    return {
        text,
        timestamp: Date.now(),
        completion_count: 0,
    };
}

export default class Hashtags {
    static getScheme(version: number) {
        switch (version) {
            case 1:
                return '&text,timestamp,completion_count';
            default:
                log.error('Invalid version number:', version);
                return null;
        }
    }

    constructor(private table: HashtagsTable) {
    }

    storeHashtag(text: string) {
        return this.table
            .where('text').equals(text)
            .modify(h => {
                h.timestamp = Date.now();
            })
            .then(num_modified => {
                if (num_modified > 0) {
                    return;
                }
                return this.table.add(textToEntry(text));
            })
            .catch((e: Error) => {
                log.error('Error on storing hashtag:', text);
                throw e;
            });
    }

    storeHashtags(texts: string[]) {
        const now = Date.now();
        return this.table
            .where('text').anyOf(texts)
            .modify(e => {
                e.timestamp = now;
                // Note: Remove element from texts.
                texts.splice(texts.indexOf(e.text), 1);
            })
            .then(num_modified => {
                if (texts.length === 0) {
                    return;
                }
                return this.table.bulkAdd(texts.map(textToEntry));
            })
            .catch((e: Error) => {
                log.error('Error on storing hashtags:', texts);
                throw e;
            });
    }

    storeHashtagsInTweet(json: Twitter.Status) {
        if (!json.entities ||
            !json.entities.hashtags ||
            json.entities.hashtags.length === 0) {
            return Dexie.Promise.resolve<void>();
        }

        return this.storeHashtags(
            json.entities.hashtags.map(e => e.text)
        ).catch((e: Error) => {
            log.error('Error on store hashtags in tweet', e, json);
            throw e;
        });
    }

    storeHashtagsInTweets(jsons: Twitter.Status[]) {
        const push = Array.prototype.push;
        const texts = [] as string[];

        for (const j of jsons) {
            if (!j.entities || !j.entities.hashtags) {
                continue;
            }
            push.apply(texts, j.entities.hashtags.map(h => h.text));
        }

        if (texts.length === 0) {
            return Dexie.Promise.resolve<void>();
        }

        return this.storeHashtags(texts)
            .catch((e: Error) => {
                log.error('Error on storing hashtags in tweets:', e, jsons);
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
