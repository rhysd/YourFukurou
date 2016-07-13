import Action from '../action_type';
import TimelineState, {DefaultTimelineState} from '../states/timeline';

export default function timeline(state: TimelineState = DefaultTimelineState, action: Action) {
    switch (action.type) {
        case 'AddTweetToTimeline':      return state.addNewTweet(action.status);
        case 'AddTweetsToTimeline':     return state.addNewTweets(action.statuses);
        case 'ChangeCurrentTimeline':   return state.switchTimeline(action.timeline);
        case 'FocusOnItem':             return state.focusOn(action.index);
        case 'FocusNextItem':           return state.focusNext();
        case 'FocusPrevItem':           return state.focusPrevious();
        case 'FocusTopItem':            return state.focusTop();
        case 'FocusBottomItem':         return state.focusBottom();
        case 'UnfocusItem':             return state.focusOn(null);
        case 'DeleteStatusInTimeline':  return state.deleteStatusWithId(action.tweet_id);
        case 'StatusLiked':             return state.updateActivity('liked', action.status, action.user);
        case 'AddMentions':             return state.addMentions(action.mentions);
        case 'CompleteMissingStatuses': return state.replaceSeparatorWithItems(action.timeline, action.index, action.items);
        case 'RetweetSucceeded':        return state.updateStatus(action.status.getMainStatus());
        case 'UnretweetSucceeded':      return state.updateStatus(action.status);
        case 'LikeSucceeded':           return state.updateStatus(action.status);
        case 'UnlikeSucceeded':         return state.updateStatus(action.status);
        case 'SetCurrentUser':          return state.setUser(action.user);
        case 'UpdateCurrentUser':       return state.updateUser(action.user_json);
        case 'AddRejectedUserIds':      return state.addRejectedIds(action.ids);
        case 'AddNoRetweetUserIds':     return state.addNoRetweetUserIds(action.ids);
        case 'RemoveRejectedUserIds':   return state.removeRejectedIds(action.ids);
        case 'AddSeparator':            return state.addSeparator();
        case 'AddFriends':              return state.addFriends(action.ids);
        case 'ResetFriends':            return state.resetFriends(action.ids);
        case 'RemoveFriends':           return state.removeFriends(action.ids);
        default:                        return state;
    }
}

