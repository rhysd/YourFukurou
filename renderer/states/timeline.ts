import {List} from 'immutable';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import log from '../log';
import PM from '../plugin_manager';

export type TimelineKind = 'home' | 'mention';

// TODO:
// Add TimelineManager
// It manages
//   - Each timeline (using immutable data)
//   - Current timeline
//   - Timeline logic
//     - Add new tweets to home timeline
//     - Filter mention tweets for mention timeline

function containsStatusInTimeline(is: List<Item>, t: Tweet) {
    'use strict';
    return is.find(i => {
        if (i instanceof Tweet) {
            return i.id === t.id;
        } else {
            return false;
        }
    });
}

function updateStatusIn(items: List<Item>, status: Tweet) {
    'use strict';
    return items.map(item => {
        if (item instanceof Tweet) {
            const id = item.getMainStatus().id;
            if (id === status.id) {
                if (item.isRetweet()) {
                    const cloned = item.clone();
                    cloned.json.retweeted_status = status.json;
                    return cloned;
                } else {
                    return status;
                }
            }
        }
        return item;
    }).toList();
}


// Note:
// This must be an immutable class because it is a part of state in a reducer
export default class TimelineState {
    constructor(
        public kind: TimelineKind = 'home',
        public home: List<Item> = List<Item>(),
        public mention: List<Item> = List<Item>(),
        public user: TwitterUser = null
    ) {}

    clone() {
        return new TimelineState(this.kind, this.home, this.mention, this.user);
    }

    addNewTweet(status: Tweet) {
        let totally_rejected = true;
        let next_home = this.home;
        let next_mention = this.mention;

        if (!PM.shouldRejectTweetInHomeTimeline(status, this)) {
            next_home = this.home.unshift(status);
            totally_rejected = false;
        }

        if (this.user && status.mentionsTo(this.user) &&
            !PM.shouldRejectTweetInMentionTimeline(status, this)) {
            next_mention = this.mention.unshift(status);
            totally_rejected = false;
        }

        if (totally_rejected) {
            return this;
        }

        return new TimelineState(this.kind, next_home, next_mention, this.user);
    }

    addSeparator(sep: Separator) {
        const next_home =
            this.home.first() instanceof Separator ?
                this.home :
                this.home.unshift(sep);
        const next_mention =
            this.mention.first() instanceof Separator ?
                this.mention :
                this.mention.unshift(sep);
        return new TimelineState(this.kind, next_home, next_mention, this.user);
    }

    switchTimeline(kind: TimelineKind) {
        if (kind === this.kind) {
            return this;
        }
        return new TimelineState(kind, this.home, this.mention, this.user);
    }

    deleteStatusWithId(id: string) {
        const predicate = (item: Item) => {
            if (item instanceof Tweet) {
                const s = item.getMainStatus();
                if (s.id === id) {
                    log.debug('Deleted status:', s);
                    return false;
                }
            }
            return true;
        };
        const next_home = this.home.filter(predicate).toList();
        const next_mention = this.mention.filter(predicate).toList();
        return new TimelineState(this.kind, next_home, next_mention, this.user);
    }

    addMentions(mentions: Tweet[]) {
        const added = List<Item>(
            mentions.filter(
                m => !containsStatusInTimeline(this.mention, m)
            )
        );
        return new TimelineState(
            this.kind,
            this.home,
            added.concat(this.mention).toList(),
            this.user
        );
    }

    updateStatus(status: Tweet) {
        // TODO:
        // Calculate the index to replace at first.
        // If there is no item to replace, simply return 'this'.
        const next_home = updateStatusIn(this.home, status);
        const next_mention = updateStatusIn(this.mention, status);
        return new TimelineState(this.kind, next_home, next_mention, this.user);
    }

    setUser(new_user: TwitterUser) {
        return new TimelineState(this.kind, this.home, this.mention, new_user);
    }

    getCurrentTimeline() {
        switch (this.kind) {
            case 'home': return this.home;
            case 'mention': return this.mention;
            default:
                log.error('Invalid timeline:', this.kind);
                return null;
        }
    }
}
