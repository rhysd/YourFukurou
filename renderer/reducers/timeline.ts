import {Action, Kind} from '../actions';
import TimelineState from '../states/timeline';

export default function timeline(state: TimelineState = new TimelineState(), action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.AddTweetToTimeline:    return state.addNewTweet(action.status);
        case Kind.AddSeparator:          return state.addSeparator(action.item);
        case Kind.ChangeCurrentTimeline: return state.switchTimeline(action.timeline);
        case Kind.DeleteStatus:          return state.deleteStatusWithId(action.tweet_id);
        case Kind.AddMentions:           return state.addMentions(action.mentions);
        case Kind.RetweetSucceeded:      return state.updateStatus(action.status.getMainStatus());
        case Kind.UnretweetSucceeded:    return state.updateStatus(action.status);
        case Kind.LikeSucceeded:         return state.updateStatus(action.status);
        case Kind.UnlikeSucceeded:       return state.updateStatus(action.status);
        case Kind.SetCurrentUser:        return state.setUser(action.user);
        default:                         return state;
    }
}

