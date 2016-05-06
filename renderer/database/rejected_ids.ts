import Dexie from 'dexie';
import log from '../log';

interface RejectedIdsScheme {
    id: number;
}

export type RejectedIdsTable = Dexie.Table<RejectedIdsScheme, number>;

export default class RejectedIds {
    static getScheme(version: number) {
        switch (version) {
            case 1:
                return '&id';
            default:
                log.error('Invalid version number:', version);
                return null;
        }
    }

    constructor(public table: RejectedIdsTable) {
    }

    storeIds(ids: number[]) {
        this.table.bulkPut(ids.map(id => ({id})));
    }

    storeId(id: number) {
        this.table.put({id});
    }

    deleteIds(ids: number[]) {
        this.table.bulkDelete(ids);
    }

    getAllIds() {
        return this.table.toArray()
            .then(ids => ids.map(e => e.id))
            .catch((e: Error): number[] => {
                log.error('Error on getting all rejected ids:', e);
                throw e;
            });
    }

    dump() {
        return this.table.toArray()
            .then(arr => log.debug('REJECTED IDS:', arr));
    }
}
