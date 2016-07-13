import Kind from '../action_kinds';
import {Action} from '../actions';
import SlaveTimeline, {
    UserTimeline,
    ConversationTimeline,
} from '../states/slave_timeline';

export default function slaveTimeline(state: SlaveTimeline | null = null, action: Action) {
    if (action.type === Kind.OpenUserTimeline) {
        return new UserTimeline(action.user!);
    }

    if (action.type === Kind.OpenConversationTimeline) {
        return ConversationTimeline.fromArray(action.statuses!);
    }

    if (state === null) {
        return state;
    }

    switch (action.type) {
        case Kind.AddUserTweets:
            if (state instanceof UserTimeline) {
                return state.user.id === action.user_id! ? state.addTweets(action.statuses!) : state;
            } else {
                return state;
            }
        case Kind.AppendPastItems:
            if (state instanceof UserTimeline) {
                return state.user.id === action.user_id! ? state.appendPastItems(action.items!) : state;
            } else {
                return state;
            }
        // TODO: Add the user's tweet received from user stream
        case Kind.CloseSlaveTimeline: return state.close();
        case Kind.FocusSlaveNext:     return state.focusNext();
        case Kind.FocusSlavePrev:     return state.focusPrev();
        case Kind.FocusSlaveTop:      return state.focusTop();
        case Kind.FocusSlaveBottom:   return state.focusBottom();
        case Kind.FocusSlaveOn:       return state.focusOn(action.index!);
        case Kind.BlurSlaveTimeline:  return state.blur();
        default:                      return state;
    }
}
