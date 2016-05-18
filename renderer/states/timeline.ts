import {List} from 'immutable';
import {Twitter} from 'twit';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import TimelineActivity, {TimelineActivityKind} from '../item/timeline_activity';
import Separator from '../item/separator';
import log from '../log';
import notifyTweet from '../notification/tweet';
import notifyLiked from '../notification/like';
import PM from '../plugin_manager';
import DB from '../database/db';
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
    const status_id = status.id;
    const index = items.findIndex(item => {
        if (item instanceof Tweet) {
            return item.getMainStatus().id === status_id;
        } else {
            return false;
        }
    });

    if (index === -1) {
        return items;
    }

    return items.update(index, item => {
        if (item instanceof Tweet) {
            if (item.isRetweet()) {
                const cloned = item.clone();
                cloned.json.retweeted_status = status.json;
                return cloned;
            } else {
                return status;
            }
        } else {
            log.error('Never reaches here');
            return item;
        }
    });
}

// Note:
// This must be an immutable class because it is a part of state in a reducer
export default class TimelineState {
    constructor(
        public kind: TimelineKind,
        public home: List<Item>,
        public mention: List<Item>,
        public user: TwitterUser,
        public notified: {home: boolean; mention: boolean},
        public rejected_ids: List<number>,
        public no_retweet_ids: List<number>,
        public focus_index: number
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
        if (this.rejected_ids.contains(status.user.id)) {
            return true;
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

    putInHome(status: Tweet): [List<Item>, number] {
        if (!status.isRetweet()) {
            return [this.home.unshift(status), this.nextFocusIndex(this.home.size + 1)];
        }

        const status_id = status.retweeted_status.id;
        const index = this.home.findIndex(item => {
            if (item instanceof Tweet) {
                return item.isRetweet() && item.retweeted_status.id === status_id;
            } else {
                return false;
            }
        });

        const next_focus_index =
            this.kind === 'home' && (index === -1 || index < this.focus_index) ?
                this.nextFocusIndex(this.home.size + 1) : this.focus_index;

        if (index === -1) {
            return [this.home.unshift(status), next_focus_index];
        }

        return [this.home.delete(index).unshift(status), next_focus_index];
    }

    addNewTweet(status: Tweet) {
        const muted_or_blocked = this.checkMutedOrBlocked(status);
        if (muted_or_blocked) {
            log.debug('Status was marked as rejected because of muted/blocked user:', status.user.screen_name, status.json);
        }

        let next_home = this.home;
        let next_mention = this.mention;

        const should_add_to_home
            = !PM.shouldRejectTweetInHomeTimeline(status, this) &&
                (!AppConfig.mute.home || !muted_or_blocked);

        const should_add_to_mention
            = this.user && status.mentionsTo(this.user) &&
                (status.user.id !== this.user.id) &&
                !PM.shouldRejectTweetInMentionTimeline(status, this) &&
                (!AppConfig.mute.mention || !muted_or_blocked);

        if (!should_add_to_home && !should_add_to_mention) {
            // Note: Nothing was changed.
            return this;
        }

        let next_focus_index = this.focus_index;

        if (should_add_to_home) {
            [next_home, next_focus_index] = this.putInHome(status);
        }

        if (should_add_to_mention) {
            if (status.isRetweet()) {
                [next_mention, next_focus_index] = this.updateActivityInMention('retweeted', status.retweeted_status, status.user);
            } else {
                next_mention = this.mention.unshift(status);
                next_focus_index = this.nextFocusIndex(next_mention.size);
            }
        }

        notifyTweet(status, this.user);

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
            this.rejected_ids,
            this.no_retweet_ids,
            next_focus_index
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
        const next_focus_index =
            (next_home !== this.home && this.kind === 'home') ||
            (next_mention !== this.mention && this.kind === 'mention') ?
                this.nextFocusIndex(next_home.size) : this.focus_index;
        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            this.notified,
            this.rejected_ids,
            this.no_retweet_ids,
            next_focus_index
        );
    }

    focusOn(index: number) {
        const size = this.getCurrentTimeline().size;
        if (index < 0 || (size - 1) < index) {
            log.debug('Focus index out of range:', index, size);
            return this;
        }

        return new TimelineState(
            this.kind,
            this.home,
            this.mention,
            this.user,
            this.notified,
            this.rejected_ids,
            this.no_retweet_ids,
            index
        );
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
            this.rejected_ids,
            this.no_retweet_ids,
            null
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
        const home_updated = next_home.size !== this.home.size;
        const mention_updated = next_mention.size !== this.mention.size;

        if (!home_updated && !mention_updated) {
            return this;
        }

        // XXX:
        // Next focus index calculation is too complicated.  I skipped it.

        return new TimelineState(
            this.kind,
            home_updated ? next_home : this.home,
            mention_updated ? next_mention : this.mention,
            this.user,
            this.notified,
            this.rejected_ids,
            this.no_retweet_ids,
            this.focus_index
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

        const next_focus_index =
            this.kind !== 'mention' || this.focus_index === null ?
                this.focus_index :
                (this.focus_index + added.size);

        return new TimelineState(
            this.kind,
            this.home,
            added.concat(this.mention).toList(),
            this.user,
            next_notified,
            this.rejected_ids,
            this.no_retweet_ids,
            next_focus_index
        );
    }

    updateStatus(status: Tweet) {
        const next_home = updateStatusIn(this.home, status);
        const next_mention = updateStatusIn(this.mention, status);
        if (next_home === this.home && next_mention === this.mention) {
            return this;
        }

        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            this.notified,
            this.rejected_ids,
            this.no_retweet_ids,
            this.focus_index
        );
    }

    setUser(new_user: TwitterUser) {
        DB.accounts.storeAccount(new_user.json);
        DB.my_accounts.storeMyAccount(new_user.json.id);
        return new TimelineState(
            this.kind,
            this.home,
            this.mention,
            new_user,
            this.notified,
            this.rejected_ids,
            this.no_retweet_ids,
            this.focus_index
        );
    }

    updateUser(update_json: Twitter.User) {
        const j = this.user.json;
        for (const prop in update_json) {
            const v = (update_json as any)[prop];
            if (v !== null) {
                (j as any)[prop] = v;
            }
        }

        DB.accounts.storeAccount(j);
        DB.my_accounts.storeMyAccount(j.id);

        const new_user = new TwitterUser(j);
        return new TimelineState(
            this.kind,
            this.home,
            this.mention,
            new_user,
            this.notified,
            this.rejected_ids,
            this.no_retweet_ids,
            this.focus_index
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
        const next_mention = this.mention.filter(predicate).toList();
        const home_updated = next_home.size !== this.home.size;
        const mention_updated = next_mention.size !== this.mention.size;
        const next_rejected_ids = this.rejected_ids.merge(will_added);

        // XXX:
        // Next focus index calculation is too complicated.  I skipped it.

        return new TimelineState(
            this.kind,
            home_updated ? next_home : this.home,
            mention_updated ? next_mention : this.mention,
            this.user,
            this.notified,
            next_rejected_ids,
            this.no_retweet_ids,
            this.focus_index
        );
    }

    addNoRetweetUserIds(ids: number[]) {
        const predicate = (i: Item) => {
            if (i instanceof Tweet) {
                return !i.isRetweet() || ids.indexOf(i.retweeted_status.user.id) === -1;
            } else {
                return true;
            }
        };

        const next_home = this.home.filter(predicate).toList();
        const next_mention = this.mention.filter(predicate).toList();
        const next_no_retweet_ids = this.no_retweet_ids.merge(ids);

        // XXX:
        // Next focus index calculation is too complicated.  I skipped it.

        return new TimelineState(
            this.kind,
            next_home,
            next_mention,
            this.user,
            this.notified,
            this.rejected_ids,
            next_no_retweet_ids,
            this.focus_index
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
            next_rejected_ids,
            this.no_retweet_ids,
            this.focus_index
        );
    }

    updateActivity(kind: TimelineActivityKind, status: Tweet, from: TwitterUser) {
        if (from.id === this.user.id) {
            // Note:
            // 'favorite' user event on stream is sent both when owner creates and when owner's
            // tweet is favorited.  We're only interested in favorites created by others because
            // favorites created by owner is already handled by LikeSucceeded action.
            return this;
        }

        if (this.checkMutedOrBlocked(status)) {
            return this;
        }

        notifyLiked(status, from);

        const next = this.updateStatus(status);
        [next.mention, next.focus_index] = next.updateActivityInMention(kind, status, from);

        if (this.kind !== 'mention' && !this.notified.mention) {
            next.notified = {
                home: this.notified.home,
                mention: true,
            };
        }

        return next;
    }
}

export const DefaultTimelineState =
    new TimelineState(
        'home',
        List<Item>(),
        List<Item>(),
        null,
        {home: false, mention: false},
        List<number>(),
        List<number>(),
        null
    );

