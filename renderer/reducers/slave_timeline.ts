import Action from '../actions/type';
import SlaveTimeline, {
    UserTimeline,
    ConversationTimeline,
} from '../states/slave_timeline';

export default function slaveTimeline(state: SlaveTimeline | null = null, action: Action) {
    if (action.type === 'OpenUserTimeline') {
        return new UserTimeline(action.user);
    }

    if (action.type === 'OpenConversationTimeline') {
        return ConversationTimeline.fromArray(action.statuses);
    }

    if (state === null) {
        return state;
    }

    switch (action.type) {
        case 'AddUserTweets':
            if (state instanceof UserTimeline) {
                return state.user.id === action.user_id ? state.addTweets(action.statuses) : state;
            } else {
                return state;
            }
        case 'AppendPastItems':
            if (state instanceof UserTimeline) {
                return state.user.id === action.user_id ? state.appendPastItems(action.items) : state;
            } else {
                return state;
            }
        // TODO: Add the user's tweet received from user stream
        case 'CloseSlaveTimeline': return state.close();
        case 'FocusSlaveNext':     return state.focusNext();
        case 'FocusSlavePrev':     return state.focusPrev();
        case 'FocusSlaveTop':      return state.focusTop();
        case 'FocusSlaveBottom':   return state.focusBottom();
        case 'FocusSlaveOn':       return state.focusOn(action.index);
        case 'BlurSlaveTimeline':  return state.blur();
        default:                   return state;
    }
}
