import Item from './item';
import Tweet, {TwitterUser} from './tweet';

export type TimelineActivityKind = 'liked' | 'retweeted';

export default class TimelineActivity implements Item {
    constructor(
        public kind: TimelineActivityKind,
        public status: Tweet,
        public by: TwitterUser[]) {
    }

    // Note: Returns updated or not
    update(tw: Tweet, u: TwitterUser) {
        if (this.status.id !== tw.id) {
            return this;
        }
        this.by.unshift(u);
        this.status = tw;
        return this.clone();
    }

    clone() {
        return new TimelineActivity(this.kind, this.status, this.by);
    }
}
