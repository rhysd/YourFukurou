import Dexie from 'dexie';
import log from '../log';
import {TwitterUser} from '../item/tweet';

interface AccountsScheme {
    id: number;
    screenname: string;
    timestamp: number;
    json: UserJson;
}

export type AccountsTable = Dexie.Table<AccountsScheme, number>;

export default class Accounts {
    static getScheme(version: number) {
        switch (version) {
            case 1:
                return '&id,&screenname,timestamp,json';
            default:
                log.error('Invalid version number:', version);
                return null;
        }
    }

    constructor(private table: AccountsTable) {
    }

    userToEntry(json: UserJson): AccountsScheme {
        return {
            id: json.id,
            screenname: json.screen_name,
            timestamp: Date.now(),
            json: json,
        };
    }

    storeAccount(json: UserJson) {
        return this.table.put(this.userToEntry(json))
            .catch((e: Error) => {
                log.error('Error on storing account:', e);
                throw e;
            });
    }

    storeAccountsInTweet(json: TweetJson) {
        this.storeAccount(json.user);
        // Note:
        // We can also store the accounts in retweeted_status and quoted_status.
        // But these accounts is not suitable to be cached because owner has a weaker relation
        // to them.
    }

    storeAccountsInTweets(jsons: TweetJson[]) {
        return this.table.bulkPut(
            jsons.map(j => this.userToEntry(j.user))
        ).catch((e: Error) => {
            log.error('Error on storing accounts in tweets', e);
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

    // TODO:
    // Consider the order
    getAllUsers() {
        return this.table.toArray()
            .catch((e: Error): TwitterUser[] => {
                log.error('Error on getting all accounts:', e);
                throw e;
            });
    }

    dump() {
        return this.table.toArray()
            .then(arr => log.debug('ACCOUNTS:', arr));
    }
}
