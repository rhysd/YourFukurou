import {EditorState} from 'draft-js';
import {Twitter} from 'twit';
import {List} from 'immutable';
import Action from './action_type';
import Item from './item/item';
import Tweet, {TwitterUser} from './item/tweet';
import Separator from './item/separator';
import {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import State from './states/root';
import {TimelineKind} from './states/timeline';
import {MessageKind} from './reducers/message';
import {searchSuggestionItems} from './components/editor/suggestions';
import log from './log';
import notifyTweet from './notification/tweet';
import notifyLiked from './notification/like';
import TwitterRestApi from './twitter/rest_api';
import DB from './database/db';

type ThunkAction = (dispatch: Redux.Dispatch, getState: () => State) => void;

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

export function addMentions(mentions: Tweet[]): ThunkAction {
    return dispatch => {
        setImmediate(() => dispatch({
            type: 'AddMentions',
            mentions,
        }));
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
        } else {
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

export function showMessage(text: string, msg_kind: MessageKind): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'ShowMessage',
            text,
            msg_kind,
        }));
    };
}

export function dismissMessage(): Action {
    return {
        type: 'DismissMessage',
    };
}

export function notImplementedYet(): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'NotImplementedYet',
        }));
    };
}

export function addSeparator(): Action {
    return {
        type: 'AddSeparator',
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

export function deleteStatusInTimeline(tweet_id: string): ThunkAction {
    return dispatch => {
        setImmediate(() => dispatch({
            type: 'DeleteStatusInTimeline',
            tweet_id,
        }));
    };
}

export function changeEditorState(editor: EditorState): Action {
    return {
        type: 'ChangeEditorState',
        editor,
    };
}

export function openEditor(text?: string): Action {
    return {
        type: 'OpenEditor',
        text,
    };
}

export function openEditorForReply(in_reply_to: Tweet, owner: TwitterUser, text?: string): Action {
    return {
        type: 'OpenEditorForReply',
        status: in_reply_to,
        user: owner,
        text,
    };
}

export function closeEditor(): Action {
    return {
        type: 'CloseEditor',
    };
}

export function toggleEditor(): Action {
    return {
        type: 'ToggleEditor',
    };
}

export function selectAutoCompleteSuggestion(text: string, query: string): Action {
    return {
        type: 'SelectAutoCompleteSuggestion',
        text,
        query,
    };
}

export function updateAutoCompletion(left: number, top: number, query: string, label: AutoCompleteLabel): ThunkAction {
    return dispatch => {
        searchSuggestionItems(query, label)
            .then(suggestions => dispatch({
                type: 'UpdateAutoCompletion',
                left,
                top,
                query,
                suggestions,
                completion_label: label,
            }))
            .catch((e: Error) => log.error('updateAutoCompletion():', e));
    };
}

export function stopAutoCompletion(): Action {
    return {
        type: 'StopAutoCompletion',
    };
}

export function downAutoCompletionFocus(): Action {
    return {
        type: 'DownAutoCompletionFocus',
    };
}

export function upAutoCompletionFocus(): Action {
    return {
        type: 'UpAutoCompletionFocus',
    };
}

export function changeCurrentTimeline(timeline: TimelineKind): Action {
    return {
        type: 'ChangeCurrentTimeline',
        timeline,
    };
}

export function openPicturePreview(media_urls: string[], index?: number): Action {
    return {
        type: 'OpenPicturePreview',
        media_urls,
        index,
    };
}

export function closeTweetMedia(): Action {
    return {
        type: 'CloseTweetMedia',
    };
}

export function moveToNthPicturePreview(index: number): Action {
    return {
        type: 'MoveToNthPicturePreview',
        index,
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

export function openUserTimeline(user: TwitterUser): Action {
    return {
        type: 'OpenUserTimeline',
        user,
    };
}

function mergeHigherOrder(left: Tweet[], right: Tweet[]) {
    const ret = [] as Tweet[];
    const push = Array.prototype.push;
    while (true) {
        if (left.length === 0) {
            push.apply(ret, right);
            return ret;
        } else if (right.length === 0) {
            push.apply(ret, left);
            return ret;
        }

        const l = left[0];
        const r = right[0];
        const cmp = l.compareId(r);

        if (cmp < 0) {
            ret.push(right.shift()!);
        } else if (cmp > 0) {
            ret.push(left.shift()!);
        } else {
            // Note: Remove duplicates
            ret.push(left.shift()!);
            right.shift();
        }
    }
}

// Note:
// This showConversation() function has some limitations.
// 1. Can't take statuses from protected accounts.  This is because of spec of search/tweets.
// 2. Can't take statuses older than a week.  This is because of the same as above.
// 3. Can't take statuses from third person in conversation.  For example, @A talks with @B starting
//    from @A's tweet.  Then @C replies to @B tweet in the conversation.  But search/tweets doesn't
//    include @C's tweets in the situation.
//
// TODO:
// We can also use timeline cache on memory to find out related statuses to the conversation.
export function gatherConversationStatuses(status: Tweet) {
    return Promise.all([
        TwitterRestApi.conversationStatuses(status.id, status.user.screen_name)
            .then(json => json.map(j => new Tweet(j))),
        Promise.resolve(status.getChainedRelatedStatuses()),
    ]).then(([from_search, from_related]) => {
        const merged = mergeHigherOrder(from_search, from_related);
        log.debug('Merged search/tweets with related tweets:', merged);
        merged.push(status);

        // Note:  Add forwarded statuses in the conversation
        while (status.in_reply_to_status !== null) {
            merged.push(status.in_reply_to_status);
            status = status.in_reply_to_status;
        }

        return merged;
    });
}

export function openConversationTimeline(status: Tweet): ThunkAction {
    return dispatch => {
        gatherConversationStatuses(status)
            .then(statuses => dispatch({
                type: 'OpenConversationTimeline',
                statuses,
            }));
    };
}

export function closeSlaveTimeline(): Action {
    return {
        type: 'CloseSlaveTimeline',
    };
}

export function addUserTweets(user_id: number, statuses: Tweet[]): Action {
    return {
        type: 'AddUserTweets',
        user_id,
        statuses,
    };
}

export function appendPastItems(user_id: number, items: Item[]): Action {
    return {
        type: 'AppendPastItems',
        user_id,
        items,
    };
}

export function focusSlaveNext(): Action {
    return {
        type: 'FocusSlaveNext',
    };
}

export function focusSlavePrev(): Action {
    return {
        type: 'FocusSlavePrev',
    };
}

export function focusSlaveTop(): Action {
    return {
        type: 'FocusSlaveTop',
    };
}

export function focusSlaveBottom(): Action {
    return {
        type: 'FocusSlaveBottom',
    };
}

export function focusSlaveOn(index: number): Action {
    return {
        type: 'FocusSlaveOn',
        index,
    };
}

export function blurSlaveTimeline(): Action {
    return {
        type: 'BlurSlaveTimeline',
    };
}

