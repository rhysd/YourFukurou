import {Twitter} from 'twit';
import {Kind, ThunkAction} from './common';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import {TimelineKind} from '../states/timeline';
import TimelineState from '../states/timeline';

export interface Action {
    type: symbol;
    next_timeline: TimelineState;
}

export function addTweetToTimeline(status: Tweet): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddTweetToTimeline,
            next_timeline: getState().timeline.addNewTweet(status),
        });
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

