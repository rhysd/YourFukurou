import Dexie from 'dexie';
import {Twitter} from 'twit';
import log from '../log';
import Tweet from '../item/tweet';

interface StatusesScheme {
    id: string;
    screen_name: string;
    user_id: number;
    in_reply_to_status_id: string | null;
    in_reply_to_user_id: number | null;
    created_at: Date;
    retweeted_status_id: string | null;
    retweeted_user_id: number | null;
    quoted_status_id: string | null;
    quoted_user_id: number | null;
    json: Twitter.Status;
}

export type StatusesTable = Dexie.Table<StatusesScheme, string>;

export default class Statuses {
    static getScheme(version: number) {
        switch (version) {
            case 1:
                return '&id,screen_name,user_id,in_reply_to_status_id,in_reply_to_user_id,created_at,retweeted_status_id,retweeted_user_id,quoted_status_id,quoted_user_id,json';
            default:
                log.error('Invalid version number:', version);
                return null;
        }
    }

    constructor(public table: StatusesTable) {
    }

    getEntryFrom(tw: Tweet): StatusesScheme {
        const rt = tw.retweeted_status;
        const qt = tw.quoted_status;
        return {
            id: tw.id,
            screen_name: tw.user.screen_name,
            user_id: tw.user.id,
            in_reply_to_status_id: tw.in_reply_to_status_id || null,
            in_reply_to_user_id: tw.in_reply_to_user_id || null,
            created_at: tw.created_at,
            retweeted_status_id: rt === null ? null : rt.id,
            retweeted_user_id: rt === null ? null : rt.user.id,
            quoted_status_id: qt === null ? null : qt.id,
            quoted_user_id: qt === null ? null : qt.user.id,
            json: tw.json,
        };
    }

    storeTweet(tw: Tweet) {
        this.table.put(this.getEntryFrom(tw));
    }

    storeTweets(tws: Tweet[]) {
        this.table.bulkPut(tws.map(tw => this.getEntryFrom(tw)));
    }

    dump() {
        return this.table.toArray()
            .then(arr => log.debug('STATUSES:', arr));
    }
}
