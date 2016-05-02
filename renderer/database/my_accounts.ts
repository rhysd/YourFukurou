import Dexie from 'dexie';
import log from '../log';

export interface MyAccountsScheme {
    id: number;
}

type TableType = Dexie.Table<MyAccountsScheme, number>;

export default class MyAccounts {
    static getScheme(version: number) {
        switch (version) {
            case 1:
                return '&id';
            default:
                log.error('Invalid version number:', version);
                return null;
        }
    }

    constructor(private table: TableType) {
    }

    storeMyAccount(user_id: number) {
        return this.table.put({
            id: user_id,
        }).catch((e: Error) => {
            log.error('Error on registering my account:', e);
            throw e;
        });
    }

    getFirstAccountId(): Dexie.Promise<number> {
        return this.table.toCollection().first()
            .then(a => a.id)
            .catch((e: Error): number => {
                log.error('Error on getting my first account:', e);
                throw e;
            });
    }
}
