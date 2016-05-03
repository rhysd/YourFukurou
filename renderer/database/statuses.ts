import Dexie from 'dexie';
import log from '../log';
import Tweet from '../item/tweet';

interface StatusesScheme {
    id: string;
    screen_name: string;
    user_id: number;
    in_reply_to_status_id: string;
    in_reply_to_user_id: number;
    created_at: Date;
    retweeted_status_id: string;
    retweeted_user_id: number;
    quoted_status_id: string;
    quoted_user_id: number;
    json: TweetJson;
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

    constructor(private table: StatusesTable) {
    }

    storeTweet(tw: Tweet) {
        const rt = tw.retweeted_status;
        const qt = tw.quoted_status;
        this.table.put({
            id: tw.id,
            screen_name: tw.user.screen_name,
            user_id: tw.user.id,
            in_reply_to_status_id: tw.in_reply_to_status_id,
            in_reply_to_user_id: tw.in_reply_to_user_id,
            created_at: tw.created_at,
            retweeted_status_id: rt === null ? null : rt.id,
            retweeted_user_id: rt === null ? null : rt.user.id,
            quoted_status_id: rt === null ? null : qt.id,
            quoted_user_id: rt === null ? null : qt.user.id,
            json: tw.json,
        });
    }

    dump() {
        return this.table.toArray()
            .then(arr => log.debug('STATUSES:', arr));
    }
}
