import {List} from 'immutable';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import log from '../log';
import PM from '../plugin_manager';
import AppConfig from '../config';

export type TimelineKind = 'home' | 'mention';

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
        public user: TwitterUser = null,
        public notified: {home: boolean; mention: boolean} = {home: false, mention: false},
        public rejected_ids: List<number> = List<number>()
    ) {}

    shouldReject(status: Tweet) {
        if (this.rejected_ids.contains(status.user.id)) {
            return true;
        }

        if (status.isRetweet() && this.rejected_ids.contains(status.retweeted_status.user.id)) {
            return true;
        }

        return false;
    }

    addNewTweet(status: Tweet) {
        const muted_or_blocked = this.shouldReject(status);
        if (muted_or_blocked) {
            log.debug('Status was marked as rejected because of muted/blocked user:', status.user.screen_name, status.json);
        }

        let next_home = this.home;
        let next_mention = this.mention;

        const should_add_to_home
            = !PM.shouldRejectTweetInHomeTimeline(status, this) &&
                (!AppConfig.mute.home || !muted_or_blocked);

        if (should_add_to_home) {
            next_home = this.home.unshift(status);
        }

        const should_add_to_mention
            = this.user && status.mentionsTo(this.user) &&
                !PM.shouldRejectTweetInMentionTimeline(status, this) &&
                (!AppConfig.mute.mention || !muted_or_blocked);

        if (should_add_to_mention) {
            next_mention = this.mention.unshift(status);
        }

        if (!should_add_to_home && !should_add_to_mention) {
            // Note: Nothing was changed.
            return this;
        }

        const next_notified = {
            home:    should_add_to_home    && this.kind !== 'home'    || this.notified.home,
            mention: should_add_to_mention && this.kind !== 'mention' || this.notified.mention,
        };

        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            next_notified,
            this.rejected_ids
        );
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
        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            this.notified,
            this.rejected_ids
        );
    }

    switchTimeline(next_kind: TimelineKind) {
        if (next_kind === this.kind) {
            return this;
        }
        const next_notified = {
            home: next_kind === 'home' ? false : this.notified.home,
            mention: next_kind === 'mention' ? false : this.notified.mention,
        };
        return new TimelineState(
            next_kind,
            this.home,
            this.mention,
            this.user,
            next_notified,
            this.rejected_ids
        );
    }

    deleteStatusWithId(id: string) {
        const predicate = (item: Item) => {
            if (item instanceof Tweet) {
                if (item.id === id) {
                    log.debug('Deleted status:', item);
                    return false;
                }
                if (item.isRetweet() && item.retweeted_status.id === id) {
                    log.debug('Deleted retweet:', item.retweeted_status);
                    return false;
                }
            }
            return true;
        };
        const next_home = this.home.filter(predicate).toList();
        const next_mention = this.mention.filter(predicate).toList();
        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            this.notified,
            this.rejected_ids
        );
    }

    addMentions(mentions: Tweet[]) {
        const added = List<Item>(
            mentions.filter(
                m => !containsStatusInTimeline(this.mention, m)
            )
        );

        const next_notified = {
            home: this.notified.home,
            mention: this.kind !== 'mention',
        };

        return new TimelineState(
            this.kind,
            this.home,
            added.concat(this.mention).toList(),
            this.user,
            next_notified,
            this.rejected_ids
        );
    }

    updateStatus(status: Tweet) {
        // TODO:
        // Calculate the index to replace at first.
        // If there is no item to replace, simply return 'this'.
        const next_home = updateStatusIn(this.home, status);
        const next_mention = updateStatusIn(this.mention, status);
        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            this.notified,
            this.rejected_ids
        );
    }

    setUser(new_user: TwitterUser) {
        return new TimelineState(
            this.kind,
            this.home,
            this.mention,
            new_user,
            this.notified,
            this.rejected_ids
        );
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

    addRejectedIds(ids: number[]) {
        const will_added = ids.filter(id => !this.rejected_ids.contains(id));
        if (will_added.length === 0) {
            return this;
        }

        const predicate = (i: Item) => {
            if (i instanceof Tweet) {
                const id = i.getMainStatus().user.id;
                return will_added.indexOf(id) === -1;
            }
            return true;
        };

        const next_home = this.home.filter(predicate).toList();
        const next_mention = this.home.filter(predicate).toList();
        const next_rejected_ids = this.rejected_ids.merge(will_added);

        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            this.notified,
            next_rejected_ids
        );
    }

    removeRejectedIds(ids: number[]) {
        const next_rejected_ids = this.rejected_ids.filter(id => ids.indexOf(id) === -1).toList();

        // Note:
        // There is no way to restore muted/blocked tweets in timeline
        return new TimelineState(
            this.kind,
            this.home,
            this.mention,
            this.user,
            this.notified,
            next_rejected_ids
        );
    }
}
