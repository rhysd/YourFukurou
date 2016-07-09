import {List} from 'immutable';
import {Twitter} from 'twit';
import {Kind, ThunkAction} from './common';
import {TimelineState, TimelineKind, Notified} from '../reducers/timeline';
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

const MaxTimelineLength = AppConfig.remote_config.max_timeline_items;
const remote = global.require('electron').remote;

function updateNotified(prev: Notified, home: boolean, mention: boolean) {
    const prev_home = prev.home;
    const prev_mention = prev.mention;
    if (home === prev_home && mention === prev_mention) {
        return prev;
    }

    if (!prev_mention && mention) {
        setBadge(true);
    } else if (prev_mention && !mention) {
        setBadge(false);
    }

    return {home, mention};
}

// TODO:
// Should consider separator
function nextFocusIndex(focus_index: number, next_size: number) {
    if (focus_index === null || next_size === 0) {
        return null;
    }
    if (focus_index === (next_size - 1)) {
        return focus_index;
    }
    return focus_index + 1;
}

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

function checkMutedOrBlocked(state: TimelineState, status: Tweet) {
    if (state.user && status.user.id === state.user.id) {
        return false;
    }

    if (state.rejected_ids.contains(status.user.id)) {
        return true;
    }

    for (const m of status.mentions) {
        if (state.rejected_ids.contains(m.id)) {
            return true;
        }
    }

    if (status.isRetweet() && state.rejected_ids.contains(status.retweeted_status.user.id)) {
        return true;
    }

    if (status.isQuotedTweet() && state.rejected_ids.contains(status.quoted_status.user.id)) {
        return true;
    }

    if (status.isRetweet() && state.no_retweet_ids.contains(status.user.id)) {
        return true;
    }

    return false;
}

function updateActivityInMention(state: TimelineState, kind: TimelineActivityKind, status: Tweet, from: TwitterUser): [List<Item>, number] {
    const status_id = status.id;
    const index = state.mention.findIndex(item => {
        if (item instanceof TimelineActivity) {
            return item.kind === kind && item.status.id === status_id;
        } else {
            return false;
        }
    });

    const next_focus_index =
        state.kind === 'mention' && (index === -1 || index < state.focus_index) ?
            nextFocusIndex(state.focus_index, state.mention.size + 1) : state.focus_index;

    if (index === -1) {
        return [state.mention.unshift(new TimelineActivity(kind, status, [from])), next_focus_index];
    } else {
        const will_updated = state.mention.get(index);
        if (will_updated instanceof TimelineActivity) {
            const updated = will_updated.update(status, from);
            return [state.mention.delete(index).unshift(updated), next_focus_index];
        } else {
            log.error('Invalid activity for update:', will_updated);
            return [state.mention, next_focus_index];
        }
    }
}

// Note:
// Currently this method is only for home timeline.
function updateRelatedStatuses(home: List<Item>, status: Tweet) {
    const s = status.getMainStatus();
    const id = s.id;
    const in_reply_to_id = s.in_reply_to_status_id;

    // Note:
    // Set related statuses to newly added status
    const statuses = [] as Tweet[];
    home.forEach(item => {
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
    return home.map(item => {
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

function putInHome(state: TimelineState, status: Tweet): [List<Item>, number] {
    const home = updateRelatedStatuses(state.home, status);
    const idx = state.focus_index;
    if (!status.isRetweet()) {
        return [
            home.unshift(status),
            state.kind === 'home' ? nextFocusIndex(idx, home.size + 1) : idx,
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

    const next_focus_index =
        state.kind === 'home' && (index === -1 || index < idx) ?
            nextFocusIndex(idx, home.size + 1) : idx;

    if (index === -1) {
        return [home.unshift(status), next_focus_index];
    }

    return [home.delete(index).unshift(status), next_focus_index];
}

export function addNewTweet(state: TimelineState, status: Tweet) {
    const muted_or_blocked = checkMutedOrBlocked(state, status);
    if (muted_or_blocked) {
        log.debug('Status was marked as rejected because of muted/blocked user:', status.user.screen_name, status.json);
    }

    let home = state.home;
    let mention = state.mention;

    const should_add_to_home
        = !PM.shouldRejectTweetInHomeTimeline(status, state) &&
            (!AppConfig.mute.home || !muted_or_blocked);

    const should_add_to_mention
        = state.user && status.mentionsTo(state.user) &&
            (status.user.id !== state.user.id) &&
            !PM.shouldRejectTweetInMentionTimeline(status, state) &&
            (!AppConfig.mute.mention || !muted_or_blocked);

    if (!should_add_to_home && !should_add_to_mention) {
        // Note: Nothing was changed.
        return null;
    }

    let focus_index = state.focus_index;

    if (should_add_to_home) {
        [home, focus_index] = putInHome(state, status);
    }

    if (should_add_to_mention) {
        if (status.isRetweet()) {
            [mention, focus_index] = updateActivityInMention(state, 'retweeted', status.retweeted_status, status.user);
        } else {
            mention = state.mention.unshift(status);
            if (state.kind === 'mention') {
                focus_index = nextFocusIndex(state.focus_index, mention.size);
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

    notifyTweet(status, state.user);

    const notified = updateNotified(
        state.notified,
        should_add_to_home    && state.kind !== 'home'    || state.notified.home,
        should_add_to_mention && state.kind !== 'mention' || state.notified.mention
    );

    return {home, mention, notified, focus_index};
}




export interface Action {
    type?: symbol;
    home?: List<Item>;
    mention?: List<Item>;
    notified?: Notified;
    focus_index?: number;

    next_timeline?: TimelineState;
}

export function addTweetToTimeline(status: Tweet): ThunkAction {
    return (dispatch, getState) => {
        const next = addNewTweet(getState().timeline, status) as Action;
        if (next === null) {
            return;
        }
        next.type = Kind.AddTweetToTimeline;
        dispatch(next);
    };
}

export function addTweetsToTimeline(statuses: Tweet[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddTweetsToTimeline,
            next_timeline: getState().timeline.addNewTweets(statuses),
        });
    };
}

export function addMentions(mentions: Tweet[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddMentions,
            next_timeline: getState().timeline.addMentions(mentions),
        });
    };
}

export function addRejectedUserIds(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddRejectedUserIds,
            next_timeline: getState().timeline.addRejectedIds(ids),
        });
    };
}

export function removeRejectedUserIds(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.RemoveRejectedUserIds,
            next_timeline: getState().timeline.removeRejectedIds(ids),
        });
    };
}

export function addNoRetweetUserIds(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddNoRetweetUserIds,
            next_timeline: getState().timeline.addNoRetweetUserIds(ids),
        });
    };
}

export function completeMissingStatuses(timeline: TimelineKind, index: number, items: Item[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.CompleteMissingStatuses,
            next_timeline: getState().timeline.replaceSeparatorWithItems(timeline, index, items),
        });
    };
}

export function updateStatus(status: Tweet): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.UpdateStatus,
            next_timeline: getState().timeline.updateStatus(status),
        });
    };
}

export function statusLiked(status: Tweet, from: TwitterUser): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.StatusLiked,
            next_timeline: getState().timeline.updateActivity('liked', status, from),
        });
    };
}

export function setCurrentUser(user: TwitterUser): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.SetCurrentUser,
            next_timeline: getState().timeline.setUser(user),
        });
    };
}

export function updateCurrentUser(user_json: Twitter.User): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.UpdateCurrentUser,
            next_timeline: getState().timeline.updateUser(user_json),
        });
    };
}

export function deleteStatusInTimeline(tweet_id: string): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.DeleteStatusInTimeline,
            next_timeline: getState().timeline.deleteStatusWithId(tweet_id),
        });
    };
}

export function changeCurrentTimeline(kind: TimelineKind): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.ChangeCurrentTimeline,
            next_timeline: getState().timeline.switchTimeline(kind),
        });
    };
}

export function focusOnItem(index: number): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusOnItem,
            next_timeline: getState().timeline.focusOn(index),
        });
    };
}

export function unfocusItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.UnfocusItem,
            next_timeline: getState().timeline.focusOn(null),
        });
    };
}

export function focusNextItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusNextItem,
            next_timeline: getState().timeline.focusNext(),
        });
    };
}

export function focusPrevItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusPrevItem,
            next_timeline: getState().timeline.focusPrevious(),
        });
    };
}

export function focusTopItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusTopItem,
            next_timeline: getState().timeline.focusTop(),
        });
    };
}

export function focusBottomItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusBottomItem,
            next_timeline: getState().timeline.focusBottom(),
        });
    };
}

export function addFriends(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddFriends,
            next_timeline: getState().timeline.addFriends(ids),
        });
    };
}

export function removeFriends(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.RemoveFriends,
            next_timeline: getState().timeline.removeFriends(ids),
        });
    };
}

export function resetFriends(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.ResetFriends,
            next_timeline: getState().timeline.resetFriends(ids),
        });
    };
}

