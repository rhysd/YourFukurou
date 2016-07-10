import Dexie from 'dexie';
import log from '../log';
import {TwitterUser} from '../item/tweet';
import {Twitter} from 'twit';
import {SuggestionItem} from '../components/editor/suggestions';

// https://github.com/dfahlander/Dexie.js#hello-world-typescript
const Promise = Dexie.Promise;
// Note:
// We can't use 'MaxSuggestions' in components/editor/suggestions.tsx
// because of circular dependency.
const MaxSuggestions = 5;

interface AccountsScheme {
    id: number;
    screenname: string;
    timestamp: number;
    completion_count: number;
    json: Twitter.User;
}

export type AccountsTable = Dexie.Table<AccountsScheme, number>;

function userToEntry(json: Twitter.User): AccountsScheme {
    return {
        id: json.id,
        screenname: json.screen_name,
        timestamp: Date.now(),
        completion_count: 0,
        json: json,
    };
}

export default class Accounts {
    static getScheme(version: number) {
        switch (version) {
            case 1:
                return '&id,&screenname,timestamp,completion_count,json';
            default:
                log.error('Invalid version number:', version);
                return null;
        }
    }

    constructor(private table: AccountsTable) {
    }

    storeAccount(json: Twitter.User) {
        return this.table
            .where('id')
            .equals(json.id)
            .modify(e => {
                e.screenname = json.screen_name;
                e.timestamp = Date.now();
                e.json = json;
            })
            .then(num_modified => {
                if (num_modified > 0) {
                    return;
                }
                return this.table.add(userToEntry(json));
            })
            .catch((e: Error) => {
                log.error('Error on storing account:', e, json);
                throw e;
            });
    }

    storeAccountsInTweet(json: Twitter.Status) {
        this.storeAccount(json.user);
        // Note:
        // We can also store the accounts in retweeted_status and quoted_status.
        // But these accounts are not suitable to be cached because owner has a weaker relation
        // to them.
    }

    storeAccountsInTweets(jsons: Twitter.Status[]) {
        const ids = jsons.map(j => j.user.id);
        const users = {} as {[id: string]: Twitter.User};
        const now = Date.now();
        for (const j of jsons) {
            users[j.user.id] = j.user;
        }

        return this.table
            .where('id')
            .anyOf(ids)
            .modify(e => {
                const u = users[e.id];
                e.screenname = u.screen_name;
                e.timestamp = now;
                e.json = u;
                delete users[e.id];
            })
            .then(num_modified => {
                const keys = Object.keys(users);
                if (keys.length === 0) {
                    return;
                }
                return this.table.bulkAdd(keys.map(id => userToEntry(users[id])));
            })
            .catch((e: Error) => {
                log.error('Error on storing accounts in tweets:', e, jsons);
                throw e;
            });
    }

    getUserById(id: number) {
        return this.table.get(id)
            .then(a => new TwitterUser(a.json))
            .catch((e: Error): TwitterUser => {
                log.error('Error on getting an account by id:', e);
                throw e;
            });
    }

    getUserByScreenName(name: string) {
        return this.table.where('screenname').equals(name)
            .limit(1)
            .toArray()
            .then(users => {
                if (users.length === 0) {
                    return null;
                }
                return new TwitterUser(users[0].json);
            })
            .catch((e: Error): TwitterUser => {
                log.error('Error on getting an account by screen name:', e);
                throw e;
            });
    }

    getUsersByScreenNameStartsWith(str: string, limit?: number) {
        const query = limit ?
            this.table.where('screenname').startsWith(str).limit(limit) :
            this.table.where('screenname').startsWith(str);

        return query.toArray()
            .then(users => users.map(u => new TwitterUser(u.json)))
            .catch((e: Error): TwitterUser[] => {
                log.error(`Error on getting accounts which start with ${str}:`, e);
                throw e;
            });
    }

    getScreenNameSuggestions(query: string) {
        return this.table
            .where('screenname').startsWith(query)
            .limit(MaxSuggestions)
            .reverse()
            .sortBy('completion_count')
            .then(
                found =>
                    found.map(e => ({
                        icon_url: e.json.profile_image_url,
                        description: '@' + e.screenname,
                    } as SuggestionItem))
            )
            .catch((e: Error) => {
                log.error('Error on getting screen name suggestion item: ', query, e);
                return [] as SuggestionItem[];
            });
    }

    // TODO:
    // Consider the order
    getAllUsers() {
        return this.table.toArray()
            .catch((e: Error): TwitterUser[] => {
                log.error('Error on getting all accounts:', e);
                throw e;
            });
    }

    upCompletionCount(ids: number[]) {
        if (ids.length === 0) {
            return Promise.resolve(false);
        }

        return this.table
            .where('id').anyOf(ids)
            .modify(e => {
                e.completion_count += 1;
            })
            .then(num_modified => num_modified > 0)
            .catch((e: Error): boolean => {
                log.error('Error on upping completion count of IDs:', ids, e);
                throw e;
            });
    }

    upCompletionCountOfMentions(json: Twitter.Status) {
        const ids = [] as number[];
        if (json.in_reply_to_user_id) {
            ids.push(json.in_reply_to_user_id);
        }

        if (json.entities && json.entities.user_mentions) {
            for (const m of json.entities.user_mentions) {
                ids.push(m.id);
            }
        }

        return this.upCompletionCount(ids);
    }

    dump() {
        return this.table.toArray()
            .then(arr => log.debug('ACCOUNTS:', arr));
    }
}
