import {List} from 'immutable';
import {Twitter} from 'twit';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import TimelineActivity, {TimelineActivityKind} from '../item/timeline_activity';
import Separator from '../item/separator';
import log from '../log';
import PM from '../plugin_manager';
import AppConfig from '../config';

const MaxTimelineLength = AppConfig.remote_config.max_timeline_items;
const remote = global.require('electron').remote;

export type TimelineKind = 'home' | 'mention';
export type Notified = {home: boolean; mention: boolean};

function containsStatusInTimeline(is: List<Item>, t: Tweet) {
    return is.find(i => {
        if (i instanceof Tweet) {
            return i.id === t.id;
        } else {
            return false;
        }
    });
}

function updateStatusIn(items: List<Item>, status: Tweet) {
    const status_id = status.id;
    const predicate = (item: Item) => {
        if (item instanceof Tweet) {
            return item.getMainStatus().id === status_id;
        } else if (item instanceof TimelineActivity) {
            return item.status.id === status_id;
        } else {
            return false;
        }
    };

    // Note:
    // One status may appear in timeline twice. (the status itself and RT for it).
    // So we need to search 2 indices for the status in timeline.

    const indices = items.reduce((acc, item, idx) => {
        if (item instanceof Tweet) {
            if (item.getMainStatus().id === status_id) {
                acc.push(idx);
            }
        } else if (item instanceof TimelineActivity) {
            if (item.status.id === status_id) {
                acc.push(idx);
            }
        }
        return acc;
    }, [] as number[]);

    if (indices.length === 0) {
        return items;
    }

    const updater = (item: Item) => {
        if (item instanceof Tweet) {
            if (item.isRetweet()) {
                const cloned = item.clone();
                cloned.json.retweeted_status = status.json;
                return cloned;
            } else {
                return status;
            }
        } else if (item instanceof TimelineActivity) {
            const cloned = item.clone();
            item.status = status;
            return cloned;
        } else {
            log.error('Never reaches here');
            return item;
        }
    };

    return items.withMutations(items_ => {
        for (const i of indices) {
            items_.update(i, updater);
        }
    });
}

function replaceSeparatorWithItemsIn(tl: List<Item>, sep_index: number, items: Item[]) {
    if (!(tl.get(sep_index) instanceof Separator)) {
        log.debug('Replace target item is not a separator:', tl.get(sep_index));
        return tl;
    }

    return tl.splice(sep_index, 1, ...items).toList();
}

function setBadge(visible: boolean) {
    window.requestIdleCallback(() => remote.app.dock.setBadge(visible ? ' ' : ''));
}

// Note:
// This must be an immutable class because it is a part of state in a reducer
export default class TimelineState {
    constructor(
        public kind: TimelineKind,
        public home: List<Item>,
        public mention: List<Item>,
        public user: TwitterUser,
        public notified: Notified,
        public rejected_ids: List<number>,
        public no_retweet_ids: List<number>,
        public focus_index: number,
        public friend_ids: List<number>
    ) {}

    updateActivityInMention(kind: TimelineActivityKind, status: Tweet, from: TwitterUser): [List<Item>, number] {
        const status_id = status.id;
        const index = this.mention.findIndex(item => {
            if (item instanceof TimelineActivity) {
                return item.kind === kind && item.status.id === status_id;
            } else {
                return false;
            }
        });

        const next_focus_index =
            this.kind === 'mention' && (index === -1 || index < this.focus_index) ?
                this.nextFocusIndex(this.mention.size + 1) : this.focus_index;

        if (index === -1) {
            return [this.mention.unshift(new TimelineActivity(kind, status, [from])), next_focus_index];
        } else {
            const will_updated = this.mention.get(index);
            if (will_updated instanceof TimelineActivity) {
                const updated = will_updated.update(status, from);
                return [this.mention.delete(index).unshift(updated), next_focus_index];
            } else {
                log.error('Invalid activity for update:', will_updated);
                return [this.mention, next_focus_index];
            }
        }
    }

    // TODO:
    // Should consider separator
    nextFocusIndex(next_size: number) {
        if (this.focus_index === null || next_size === 0) {
            return null;
        }
        if (this.focus_index === (next_size - 1)) {
            return this.focus_index;
        }
        return this.focus_index + 1;
    }

    // TODO:
    // Should consider separator
    prevFocusIndex(next_size: number) {
        if (this.focus_index === null || next_size === 0) {
            return null;
        }
        if (this.focus_index === 0) {
            return 0;
        }
        return this.focus_index - 1;
    }

    checkMutedOrBlocked(status: Tweet) {
        if (this.user && status.user.id === this.user.id) {
            return false;
        }

        if (this.rejected_ids.contains(status.user.id)) {
            return true;
        }

        for (const m of status.mentions) {
            if (this.rejected_ids.contains(m.id)) {
                return true;
            }
        }

        if (status.isRetweet() && this.rejected_ids.contains(status.retweeted_status.user.id)) {
            return true;
        }

        if (status.isQuotedTweet() && this.rejected_ids.contains(status.quoted_status.user.id)) {
            return true;
        }

        if (status.isRetweet() && this.no_retweet_ids.contains(status.user.id)) {
            return true;
        }

        return false;
    }

    shouldAddToTimeline(status: Tweet) {
        const muted_or_blocked = this.checkMutedOrBlocked(status);

        const should_add_to_home =
              !PM.shouldRejectTweetInHomeTimeline(status, this) &&
                (!AppConfig.mute.home || !muted_or_blocked);

        const should_add_to_mention =
              this.user && status.mentionsTo(this.user) &&
                (status.user.id !== this.user.id) &&
                !PM.shouldRejectTweetInMentionTimeline(status, this) &&
                (!AppConfig.mute.mention || !muted_or_blocked);

        return {
            home: !!should_add_to_home,
            mention: !!should_add_to_mention,
        };
    }

    // Note:
    // Currently this method is only for home timeline.
    updateRelatedStatuses(status: Tweet) {
        const s = status.getMainStatus();
        const id = s.id;
        const in_reply_to_id = s.in_reply_to_status_id;

        // Note:
        // Set related statuses to newly added status
        const statuses = [] as Tweet[];
        this.home.forEach(item => {
            if (item instanceof Tweet) {
                const i = item.in_reply_to_status_id;
                if (i && i === id) {
                    statuses.push(item);
                }
                if (in_reply_to_id === item.id) {
                    status.in_reply_to_status = item;
                }
            }
        });
        if (statuses.length > 0) {
            status.related_statuses = statuses;
        }

        // Note:
        // Update existing statuses in timeline considering the newly added status.
        return this.home.map(item => {
            if (item instanceof Tweet) {
                const main = item.getMainStatus();
                if (main.id === in_reply_to_id) {
                    const cloned = item.clone();
                    cloned.related_statuses.push(status);
                    log.debug('Related status updated:', cloned.related_statuses, cloned.json);
                    return cloned;
                } else if (main.in_reply_to_status_id === id) {
                    // Note:
                    // When above 'main.id === in_reply_to_id' condition is met,
                    // it never reaches here because no status can refer the same status
                    // as both in-reply-to status and in-reply-to-ed status at once.
                    const cloned = item.clone();
                    cloned.in_reply_to_status = s;
                    log.debug('In-reply-to status updated:', cloned);
                    return cloned;
                }
            }
            return item;
        }).toList();
    }

    putInHome(status: Tweet): [List<Item>, number] {
        const home = this.updateRelatedStatuses(status);
        const in_home = this.kind === 'home';
        if (!status.isRetweet()) {
            return [
                home.unshift(status),
                in_home ? this.nextFocusIndex(home.size + 1) : this.focus_index,
            ];
        }

        const status_id = status.retweeted_status.id;
        const index = home.findIndex(item => {
            if (item instanceof Tweet) {
                return item.isRetweet() && item.retweeted_status.id === status_id;
            } else {
                return false;
            }
        });

        if (index === -1) {
            return [
                home.unshift(status),
                in_home ? this.nextFocusIndex(home.size + 1) : this.focus_index,
            ];
        }

        return [
            home.delete(index).unshift(status),
            in_home && (this.focus_index < index) ?
                this.nextFocusIndex(home.size) : this.focus_index,
        ];
    }

    updateNotified(home: boolean, mention: boolean) {
        const prev_home = this.notified.home;
        const prev_mention = this.notified.mention;
        if (home === prev_home && mention === prev_mention) {
            return this.notified;
        }

        if (!prev_mention && mention) {
            setBadge(true);
        } else if (prev_mention && !mention) {
            setBadge(false);
        }

        return {home, mention};
    }

    addNewTweets(statuses: Tweet[]) {
        let next: TimelineState = this;
        for (const s of statuses) {
            next = next.addNewTweet(s);
        }
        return next;
    }

    addNewTweet(status: Tweet) {
        const should_add_to = this.shouldAddToTimeline(status);

        if (!should_add_to.home && !should_add_to.mention) {
            // Note: Nothing was changed.
            log.debug('Status was marked as rejected:', status.user.screen_name, status.json);
            return this;
        }

        let home = this.home;
        let mention = this.mention;
        let focus_index = this.focus_index;

        if (should_add_to.home) {
            [home, focus_index] = this.putInHome(status);
        }

        if (should_add_to.mention) {
            if (status.isRetweet()) {
                [mention, focus_index] = this.updateActivityInMention('retweeted', status.retweeted_status, status.user);
            } else {
                mention = this.mention.unshift(status);
                if (this.kind === 'mention') {
                    focus_index = this.nextFocusIndex(mention.size);
                }
            }
        }

        if (MaxTimelineLength !== null) {
            if (home.size > MaxTimelineLength) {
                home = home.take(MaxTimelineLength).toList();
            }
            if (mention.size > MaxTimelineLength) {
                mention = mention.take(MaxTimelineLength).toList();
            }
        }

        const notified = this.updateNotified(
            should_add_to.home    && this.kind !== 'home'    || this.notified.home,
            should_add_to.mention && this.kind !== 'mention' || this.notified.mention
        );

        return this.update({home, mention, notified, focus_index});
    }

    addSeparator() {
        const sep = new Separator();

        const home =
            this.home.first() instanceof Separator ?
                this.home :
                this.home.unshift(sep);

        const mention =
            this.mention.first() instanceof Separator ?
                this.mention :
                this.mention.unshift(sep);

        const focus_index =
            (home !== this.home && this.kind === 'home') ||
            (mention !== this.mention && this.kind === 'mention') ?
                this.nextFocusIndex(home.size) : this.focus_index;

        return this.update({home, mention, focus_index});
    }

    focusOn(index: number) {
        const size = this.getCurrentTimeline().size;
        if (index < 0 || (size - 1) < index) {
            log.debug('Focus index out of range:', index, size);
            return this;
        }

        return this.update({focus_index: index});
    }

    focusNext() {
        if (this.focus_index === null) {
            return this.focusTop();
        }
        return this.focusOn(this.focus_index + 1);
    }

    focusPrevious() {
        if (this.focus_index === null) {
            return this;
        }
        return this.focusOn(this.focus_index - 1);
    }

    focusTop() {
        return this.focusOn(0);
    }

    focusBottom() {
        return this.focusOn(this.getCurrentTimeline().size - 1);
    }

    switchTimeline(kind: TimelineKind) {
        if (kind === this.kind) {
            return this;
        }
        const notified = this.updateNotified(
            kind === 'home' ? false : this.notified.home,
            kind === 'mention' ? false : this.notified.mention
        );
        return this.update({kind, notified, focus_index: null});
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
        const home_updated = next_home.size !== this.home.size;
        const mention_updated = next_mention.size !== this.mention.size;

        if (!home_updated && !mention_updated) {
            return this;
        }

        // XXX:
        // Next focus index calculation is too complicated.  I skipped it.

        return this.update({
            home: home_updated ? next_home : this.home,
            mention: mention_updated ? next_mention : this.mention,
        });
    }

    addMentions(mentions: Tweet[]) {
        const added = List<Item>(
            mentions.filter(
                m => !containsStatusInTimeline(this.mention, m)
            )
        );

        const notified = this.updateNotified(this.notified.home, this.kind !== 'mention');

        const focus_index =
            this.kind !== 'mention' || this.focus_index === null ?
                this.focus_index :
                (this.focus_index + added.size);

        let next_mention = added.concat(this.mention);
        if (MaxTimelineLength !== null && next_mention.size > MaxTimelineLength) {
            next_mention = next_mention.take(MaxTimelineLength);
        }

        return this.update({
            mention: next_mention.toList(),
            notified,
            focus_index,
        });
    }

    updateStatus(status: Tweet) {
        const home = updateStatusIn(this.home, status);
        const mention = updateStatusIn(this.mention, status);
        if (home === this.home && mention === this.mention) {
            return this;
        }

        return this.update({home, mention});
    }

    setUser(user: TwitterUser) {
        return this.update({user});
    }

    updateUser(update_json: Twitter.User) {
        const j = this.user.json;
        for (const prop in update_json) {
            const v = (update_json as any)[prop];
            if (v !== null) {
                (j as any)[prop] = v;
            }
        }

        return this.update({
            user: new TwitterUser(j),
        });
    }

    getCurrentTimeline() {
        return this.getTimeline(this.kind);
    }

    getTimeline(kind: TimelineKind) {
        switch (kind) {
            case 'home':
                return this.home;
            case 'mention':
                return this.mention;
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
                if (i.isRetweet() && will_added.indexOf(i.retweeted_status.user.id) !== -1) {
                    return false;
                }
                return will_added.indexOf(i.user.id) === -1;
            } else {
                return true;
            }
        };

        const next_home = this.home.filter(predicate).toList();
        const next_mention = this.mention.filter(predicate).toList();
        const home_updated = next_home.size !== this.home.size;
        const mention_updated = next_mention.size !== this.mention.size;
        const rejected_ids = this.rejected_ids.concat(will_added).toList();

        // XXX:
        // Next focus index calculation is too complicated.  I skipped it.

        return this.update({
            home: home_updated ? next_home : this.home,
            mention: mention_updated ? next_mention : this.mention,
            rejected_ids,
        });
    }

    addNoRetweetUserIds(ids: number[]) {
        const predicate = (i: Item) => {
            if (i instanceof Tweet) {
                return !i.isRetweet() || ids.indexOf(i.retweeted_status.user.id) === -1;
            } else {
                return true;
            }
        };

        const home = this.home.filter(predicate).toList();
        const mention = this.mention.filter(predicate).toList();
        const no_retweet_ids = this.no_retweet_ids.merge(ids);

        // XXX:
        // Next focus index calculation is too complicated.  I skipped it.

        return this.update({home, mention, no_retweet_ids});
    }

    removeRejectedIds(ids: number[]) {
        const rejected_ids = this.rejected_ids.filter(id => ids.indexOf(id) === -1).toList();

        // Note:
        // There is no way to restore muted/blocked tweets in timeline
        return this.update({rejected_ids});
    }

    updateActivity(kind: TimelineActivityKind, status: Tweet, from: TwitterUser) {
        if (from.id === this.user.id) {
            // Note:
            // 'favorite' user event on stream is sent both when owner creates and when owner's
            // tweet is favorited.  We're only interested in favorites created by others because
            // favorites created by owner is already handled by LikeSucceeded action.
            return this;
        }

        const status_updated = this.updateStatus(status);

        // Note:
        // this.updateStatus doesn't update timeline if no item is updated.
        // So I need to update explicitly when timeline is not updated yet.
        const next = status_updated === this ? status_updated.update({}) : status_updated;

        [next.mention, next.focus_index] = next.updateActivityInMention(kind, status, from);
        if (MaxTimelineLength !== null && next.mention.size > MaxTimelineLength) {
            next.mention = next.mention.take(MaxTimelineLength).toList();
        }

        if (this.kind !== 'mention' && !this.notified.mention) {
            next.notified = this.updateNotified(this.notified.home, true);
        }

        return next;
    }

    addFriends(ids: number[]) {
        const will_added = ids.filter(id => !this.friend_ids.contains(id));
        if (will_added.length === 0) {
            return this;
        }

        return this.update({
            friend_ids: this.friend_ids.merge(will_added),
        });
    }

    removeFriends(ids: number[]) {
        const friend_ids = this.friend_ids.filter(id => ids.indexOf(id) === -1).toList();
        return this.update({friend_ids});
    }

    resetFriends(ids: number[]) {
        const friend_ids = List<number>(ids);
        return this.update({friend_ids});
    }

    replaceSeparatorWithItems(kind: TimelineKind, sep_index: number, items: Item[]) {
        switch (kind) {
            case 'home':
                const home = replaceSeparatorWithItemsIn(this.home, sep_index, items);
                let next = this.update({home});
                for (const i of items.reverse()) {
                    if (i instanceof Tweet) {
                        next.home = next.updateRelatedStatuses(i);
                    }
                }
                return next;
            case 'mention':
                return this.update({
                    mention: replaceSeparatorWithItemsIn(this.mention, sep_index, items),
                });
            default:
                log.debug('Invalid timeline for replacing separator with statuses');
                return this;
        }
    }

    update(next: {
        kind?: TimelineKind;
        home?: List<Item>;
        mention?: List<Item>;
        user?: TwitterUser;
        notified?: Notified;
        rejected_ids?: List<number>;
        no_retweet_ids?: List<number>;
        focus_index?: number;
        friend_ids?: List<number>;
    }) {
        return new TimelineState(
            next.kind           === undefined ? this.kind : next.kind,
            next.home           === undefined ? this.home : next.home,
            next.mention        === undefined ? this.mention : next.mention,
            next.user           === undefined ? this.user : next.user,
            next.notified       === undefined ? this.notified : next.notified,
            next.rejected_ids   === undefined ? this.rejected_ids : next.rejected_ids,
            next.no_retweet_ids === undefined ? this.no_retweet_ids : next.no_retweet_ids,
            next.focus_index    === undefined ? this.focus_index : next.focus_index,
            next.friend_ids     === undefined ? this.friend_ids : next.friend_ids
        );
    }
}

export const DefaultTimelineState =
    new TimelineState(
        'home',
        List<Item>([new Separator()]),
        List<Item>([new Separator()]),
        null,
        {home: false, mention: false},
        List<number>(),
        List<number>(),
        null,
        List<number>()
    );

