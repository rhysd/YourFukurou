import {List} from 'immutable';
import {Kind} from '../actions/common';
import {Action} from '../actions/timeline';
import {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import Item from '../item/item';

export type TimelineKind = 'home' | 'mention';
export type Notified = {home: boolean; mention: boolean};

export interface TimelineState {
    kind: TimelineKind;
    home: List<Item>;
    mention: List<Item>;
    user: TwitterUser;
    notified: Notified;
    rejected_ids: List<number>;
    no_retweet_ids: List<number>;
    focus_index: number;
    friend_ids: List<number>;
}

const DefaultTimelineState = {
    kind: 'home',
    home: List<Item>([new Separator()]),
    mention: List<Item>([new Separator()]),
    user: null,
    notified: {home: false, mention: false},
    rejected_ids:  List<number>(),
    no_retweet_ids: List<number>(),
    focus_index: null,
    friend_ids: List<number>(),
} as TimelineState;

export default function timeline(state: TimelineState = DefaultTimelineState, action: Action): TimelineState {
    switch (action.type) {
        case Kind.AddTweetToTimeline:      return action.next_timeline;
        case Kind.AddTweetsToTimeline:     return action.next_timeline;
        case Kind.ChangeCurrentTimeline:   return action.next_timeline;
        case Kind.FocusOnItem:             return action.next_timeline;
        case Kind.FocusNextItem:           return action.next_timeline;
        case Kind.FocusPrevItem:           return action.next_timeline;
        case Kind.FocusTopItem:            return action.next_timeline;
        case Kind.FocusBottomItem:         return action.next_timeline;
        case Kind.UnfocusItem:             return action.next_timeline;
        case Kind.DeleteStatusInTimeline:  return action.next_timeline;
        case Kind.StatusLiked:             return action.next_timeline;
        case Kind.AddMentions:             return action.next_timeline;
        case Kind.CompleteMissingStatuses: return action.next_timeline;
        case Kind.UpdateStatus:            return action.next_timeline;
        case Kind.SetCurrentUser:          return action.next_timeline;
        case Kind.UpdateCurrentUser:       return action.next_timeline;
        case Kind.AddRejectedUserIds:      return action.next_timeline;
        case Kind.AddNoRetweetUserIds:     return action.next_timeline;
        case Kind.RemoveRejectedUserIds:   return action.next_timeline;
        case Kind.AddSeparator:            return action.next_timeline;
        case Kind.AddFriends:              return action.next_timeline;
        case Kind.ResetFriends:            return action.next_timeline;
        case Kind.RemoveFriends:           return action.next_timeline;
        default:                           return state;
    }
}

