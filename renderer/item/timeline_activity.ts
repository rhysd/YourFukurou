import Item from './item';
import Tweet, {TwitterUser} from './tweet';
import log from '../log';

export type TimelineActivityKind = 'liked' | 'retweeted';

export default class TimelineActivity implements Item {
    constructor(
        public kind: TimelineActivityKind,
        public status: Tweet,
        public by: TwitterUser[]) {
    }

    notExistsYet(id: number) {
        for (const u of this.by) {
            if (u.id === id) {
                return false;
            }
        }
        return true;
    }

    // Note: Returns updated or not
    update(tw: Tweet, u: TwitterUser) {
        if (this.status.id !== tw.id) {
            log.error('Activity update: ID mismatch:', this.status, tw);
            return this;
        }
        if (this.notExistsYet(u.id)) {
            this.by.unshift(u);
        }
        this.status = tw;
        log.debug(`Activity '${this.kind}'was updated:`, tw, u);
        return this.clone();
    }

    clone() {
        return new TimelineActivity(this.kind, this.status, this.by);
    }
}
