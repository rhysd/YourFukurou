import {Twitter} from 'twit';
import {List} from 'immutable';
import Action, {ThunkAction} from './type';
import Separator from '../item/separator';
import {TimelineKind} from '../states/timeline';
import notifyTweet from '../notification/tweet';
import notifyLiked from '../notification/like';
import DB from '../database/db';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import TwitterRestApi from '../twitter/rest_api';
import log from '../log';

export function addTweetToTimeline(status: Tweet): ThunkAction {
    return (dispatch, getState) => {
        const timeline = getState().timeline;
        setImmediate(() => {
            dispatch({
                type: 'AddTweetToTimeline',
                status,
            });

            const should_add_to = timeline.shouldAddToTimeline(status);
            if (timeline.user && (should_add_to.home || should_add_to.mention)) {
                notifyTweet(status, timeline.user);
            }
        });
    };
}

export function addTweetsToTimeline(statuses: Tweet[]): Action {
    return {
        type: 'AddTweetsToTimeline',
        statuses,
    };
}

export function changeCurrentTimeline(timeline: TimelineKind): Action {
    return {
        type: 'ChangeCurrentTimeline',
        timeline,
    };
}

export function focusOnItem(index: number): Action {
    return {
        type: 'FocusOnItem',
        index,
    };
}

export function unfocusItem(): Action {
    return {
        type: 'UnfocusItem',
    };
}

export function focusNextItem(): Action {
    return {
        type: 'FocusNextItem',
    };
}

export function focusPrevItem(): Action {
    return {
        type: 'FocusPrevItem',
    };
}

export function focusTopItem(): Action {
    return {
        type: 'FocusTopItem',
    };
}

export function focusBottomItem(): Action {
    return {
        type: 'FocusBottomItem',
    };
}

export function deleteStatusInTimeline(tweet_id: string): ThunkAction {
    return dispatch => {
        setImmediate(() => dispatch({
            type: 'DeleteStatusInTimeline',
            tweet_id,
        }));
    };
}

export function statusLiked(status: Tweet, from: TwitterUser): ThunkAction {
    return (dispatch, getState) => {
        const timeline = getState().timeline;
        dispatch({
            type: 'StatusLiked',
            user: from,
            status,
        });

        setImmediate(() => {
            // Note:
            // We don't check the status is marked as 'rejected' because activities are related to
            // owner's tweet and it must not be rejected.
            if (timeline.user && from.id !== timeline.user.id) {
                notifyLiked(status, from);
            }
        });
    };
}

export function addMentions(mentions: Tweet[]): ThunkAction {
    return dispatch => {
        setImmediate(() => dispatch({
            type: 'AddMentions',
            mentions,
        }));
    };
}

function getMissingTweets(kind: TimelineKind, max_id: string | undefined, since_id: string | undefined) {
    switch (kind) {
        case 'home':
            return TwitterRestApi.missingHomeTimeline(max_id, since_id);
        case 'mention':
            return TwitterRestApi.missingMentionTimeline(max_id, since_id);
        default:
            return Promise.resolve([] as Twitter.Status[]);
    }
}

// Note:
// Should getting missing status at specific index of timeline be moved to TwitterRestApi class?
function getMissingItemsAt(sep_index: number, kind: TimelineKind, current_items: List<Item>) {
    const size = current_items.size;

    let before: Tweet | null = null;
    let after: Tweet | null = null;

    let idx = sep_index - 1;
    while (idx >= 0) {
        const t = current_items.get(idx);
        if (t instanceof Tweet) {
            before = t;
            break;
        }
        --idx;
    }

    idx = sep_index + 1;
    while (idx < size) {
        const t = current_items.get(idx);
        if (t instanceof Tweet) {
            after = t;
            break;
        }
        ++idx;
    }

    const max_id = before ? before.id : undefined;
    const since_id = after ? after.id : undefined;

    log.debug('Will obtain missing statuses in timeline:', max_id, since_id);

    return getMissingTweets(kind, max_id, since_id).then(tweets => {
        if (tweets.length === 0) {
            return [] as Item[];
        }

        const items = tweets.map(json => new Tweet(json) as Item);

        if (tweets[0].id_str === max_id) {
            // Note:
            // 'max_id' status duplicates because it is included in response.
            items.shift();
            if (items.length === 0) {
                return [] as Item[];
            }
        } else if (sep_index !== 0) {
            log.error('First status of missing statuses sequence is not a max_id status', items);
        }

        // Note:
        // Even if all missing statuses are completed, we may enter into below 'if' clause.
        // This is because there is no guarantee to fetch N statuses when specifying 'count: N'.
        // When timeline including deleted or suspended statuses, they may be removed from fetching statuses.
        items.push(new Separator());

        return items;
    });
}

export function completeMissingStatuses(sep_index: number, timeline_kind?: TimelineKind): ThunkAction {
    return (dispatch, getState) => {
        const timeline = getState().timeline;
        const kind = timeline_kind || timeline.kind;
        const items = timeline.getTimeline(kind);
        getMissingItemsAt(sep_index, kind, items).then((missings: Item[]) => {
            dispatch({
                type: 'CompleteMissingStatuses',
                timeline: kind,
                index: sep_index,
                items: missings,
            });
        });
    };
}

export function retweetSucceeded(status: Tweet): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'RetweetSucceeded',
            status,
        }));
    };
}

export function unretweetSucceeded(status: Tweet): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'UnretweetSucceeded',
            status,
        }));
    };
}

export function likeSucceeded(status: Tweet): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'LikeSucceeded',
            status,
        }));
    };
}

export function unlikeSucceeded(status: Tweet): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'UnlikeSucceeded',
            status,
        }));
    };
}

export function setCurrentUser(user: TwitterUser): Action {
    DB.accounts.storeAccount(user.json);
    DB.my_accounts.storeMyAccount(user.json.id);
    return {
        type: 'SetCurrentUser',
        user,
    };
}

export function updateCurrentUser(user_json: Twitter.User): Action {
    DB.accounts.storeAccount(user_json);
    DB.my_accounts.storeMyAccount(user_json.id);
    return {
        type: 'UpdateCurrentUser',
        user_json,
    };
}

export function addRejectedUserIds(ids: number[]): Action {
    return {
        type: 'AddRejectedUserIds',
        ids,
    };
}

export function removeRejectedUserIds(ids: number[]): Action {
    return {
        type: 'RemoveRejectedUserIds',
        ids,
    };
}

export function addNoRetweetUserIds(ids: number[]): Action {
    return {
        type: 'AddNoRetweetUserIds',
        ids,
    };
}

export function addSeparator(): Action {
    return {
        type: 'AddSeparator',
    };
}

export function addFriends(ids: number[]): Action {
    return {
        type: 'AddFriends',
        ids,
    };
}

export function removeFriends(ids: number[]): Action {
    return {
        type: 'RemoveFriends',
        ids,
    };
}

export function resetFriends(ids: number[]): Action {
    return {
        type: 'ResetFriends',
        ids,
    };
}


