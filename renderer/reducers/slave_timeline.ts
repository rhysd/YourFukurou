import {Action, Kind} from '../actions';
import SlaveTimeline, {UserTimeline} from '../states/slave_timeline';

export default function slaveTimeline(state: SlaveTimeline = null, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.OpenUserTimeline:   return new UserTimeline(action.user);
        case Kind.CloseSlaveTimeline: return state === null ? null : state.close();
        default:                      return state;
    }
}
