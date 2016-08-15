import Action, {ThunkAction} from './type';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import log from '../log';
import TwitterRestApi from '../twitter/rest_api';
import KeymapTransition from '../keybinds/keymap_transition';

export function openUserTimeline(user: TwitterUser): ThunkAction {
    return dispatch => {
        KeymapTransition.enterSlaveTimeline();
        dispatch({
            type: 'OpenUserTimeline',
            user,
        });
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
            .then(statuses => {
                KeymapTransition.enterSlaveTimeline();
                dispatch({
                    type: 'OpenConversationTimeline',
                    statuses,
                });
            });
    };
}

export function closeSlaveTimeline(): ThunkAction {
    return (dispatch, getState) => {
        KeymapTransition.escapeFromCurrentKeymaps(getState());
        dispatch({
            type: 'CloseSlaveTimeline',
        });
    };
}

export function backSlaveTimeline(): Action {
    return {
        type: 'BackSlaveTimeline',
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

