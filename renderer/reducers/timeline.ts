import Kind from '../action_kinds';
import {Action} from '../actions';
import TimelineState, {DefaultTimelineState} from '../states/timeline';

export default function timeline(state: TimelineState = DefaultTimelineState, action: Action) {
    switch (action.type) {
        case Kind.AddTweetToTimeline:      return state.addNewTweet(action.status);
        case Kind.AddTweetsToTimeline:      return state.addNewTweets(action.statuses);
        case Kind.ChangeCurrentTimeline:   return state.switchTimeline(action.timeline);
        case Kind.FocusOnItem:             return state.focusOn(action.index);
        case Kind.FocusNextItem:           return state.focusNext();
        case Kind.FocusPrevItem:           return state.focusPrevious();
        case Kind.FocusTopItem:            return state.focusTop();
        case Kind.FocusBottomItem:         return state.focusBottom();
        case Kind.UnfocusItem:             return state.focusOn(null);
        case Kind.DeleteStatusInTimeline:  return state.deleteStatusWithId(action.tweet_id);
        case Kind.StatusLiked:             return state.updateActivity('liked', action.status, action.user);
        case Kind.AddMentions:             return state.addMentions(action.mentions);
        case Kind.CompleteMissingStatuses: return state.replaceSeparatorWithItems(action.timeline, action.index, action.items);
        case Kind.RetweetSucceeded:        return state.updateStatus(action.status.getMainStatus());
        case Kind.UnretweetSucceeded:      return state.updateStatus(action.status);
        case Kind.LikeSucceeded:           return state.updateStatus(action.status);
        case Kind.UnlikeSucceeded:         return state.updateStatus(action.status);
        case Kind.SetCurrentUser:          return state.setUser(action.user);
        case Kind.UpdateCurrentUser:       return state.updateUser(action.user_json);
        case Kind.AddRejectedUserIds:      return state.addRejectedIds(action.ids);
        case Kind.AddNoRetweetUserIds:     return state.addNoRetweetUserIds(action.ids);
        case Kind.RemoveRejectedUserIds:   return state.removeRejectedIds(action.ids);
        case Kind.AddSeparator:            return state.addSeparator();
        case Kind.AddFriends:              return state.addFriends(action.ids);
        case Kind.ResetFriends:            return state.resetFriends(action.ids);
        case Kind.RemoveFriends:           return state.removeFriends(action.ids);
        default:                           return state;
    }
}

