import {Action, Kind} from '../actions';
import {List} from 'immutable';
import SlaveTimeline from '../states/slave_timeline';

export default function slaveTimeline(state: SlaveTimeline = null, action: Action) {

    // TODO: Add the user's tweet received from user stream

    switch (action.type) {
        case Kind.OpenUserTimeline:         return action.next_slave;
        case Kind.OpenConversationTimeline: return action.next_slave;
        case Kind.AddUserTweets:            return action.next_slave;
        case Kind.AppendPastItems:          return action.next_slave;
        case Kind.CloseSlaveTimeline:       return action.next_slave;
        case Kind.FocusSlaveNext:           return action.next_slave;
        case Kind.FocusSlavePrev:           return action.next_slave;
        case Kind.FocusSlaveTop:            return action.next_slave;
        case Kind.FocusSlaveBottom:         return action.next_slave;
        case Kind.FocusSlaveOn:             return action.next_slave;
        case Kind.BlurSlaveTimeline:        return action.next_slave;
        default:                            return state;
    }
}
