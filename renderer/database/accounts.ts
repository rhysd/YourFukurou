import Dexie from 'dexie';
import log from '../log';
import Store from '../store';
import {setCurrentUser} from '../actions';
import {TwitterUser} from '../item/tweet';

export interface AccountsScheme {
    id: number;
    screenname: string;
    timestamp: number;
    json: UserJson;
}

type TableType = Dexie.Table<AccountsScheme, number>;

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

    constructor(private table: TableType) {
    }

    storeAccount(json: UserJson) {
        return this.table.put({
            id: json.id,
            screenname: json.screen_name,
            timestamp: Date.now(),
            json: json,
        }).catch((e: Error) => {
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

    getUserById(id: number) {
        return this.table.get(id)
            .then(a => new TwitterUser(a.json))
            .catch((e: Error): TwitterUser => {
                log.error('Error on getting an account by id:', e);
                throw e;
            });
    }
}
