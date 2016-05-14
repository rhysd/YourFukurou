import Item from './item';
import Tweet, {TwitterUser} from './tweet';

export type TimelineActivityKind = 'liked' | 'retweeted';

export default class TimelineActivity implements Item {
    constructor(
        public kind: TimelineActivityKind,
        public status: Tweet,
        public by: TwitterUser[]) {
    }

    findUserById(id: number) {
        for (const u of this.by) {
            if (u.id === id) {
                return true;
            }
        }
        return false;
    }

    // Note: Returns updated or not
    update(tw: Tweet, u: TwitterUser) {
        if (this.status.id !== tw.id) {
            return this;
        }
        if (this.findUserById(u.id)) {
            this.by.unshift(u);
        }
        this.status = tw;
        return this.clone();
    }

    clone() {
        return new TimelineActivity(this.kind, this.status, this.by);
    }
}
