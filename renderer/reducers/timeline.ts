import {Kind} from '../actions/common';
import {Action} from '../actions/timeline';
import TimelineState, {DefaultTimelineState} from '../states/timeline';

export default function timeline(state: TimelineState = DefaultTimelineState, action: Action) {
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

