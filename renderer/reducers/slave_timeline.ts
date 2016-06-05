import {Action, Kind} from '../actions';
import SlaveTimeline, {UserTimeline} from '../states/slave_timeline';

export default function slaveTimeline(state: SlaveTimeline = null, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.OpenUserTimeline:   return new UserTimeline(action.user);
        case Kind.AddUserTweets:
            if (state instanceof UserTimeline) {
                return state.user.id === action.user_id ? state.addTweets(action.statuses) : state;
            } else {
                return state;
            }
        // TODO: Add the user's tweet received from user stream
        case Kind.CloseSlaveTimeline: return state === null ? null : state.close();
        default:                      return state;
    }
}
