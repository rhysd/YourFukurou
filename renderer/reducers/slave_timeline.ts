import Action from '../actions/type';
import SlaveTimelineState, {DefaultSlaveTimelineState} from '../states/slave_timeline';

export default function slaveTimeline(state: SlaveTimelineState = DefaultSlaveTimelineState, action: Action) {
    if (action.type === 'OpenUserTimeline') {
        return state.openUserTimeline(action.user);
    }

    if (action.type === 'OpenConversationTimeline') {
        return state.openConversationTimeline(action.statuses);
    }

    switch (action.type) {
        case 'AddUserTweets':
            const statuses = action.statuses;
            return state.modifyUserTimeline(
                action.user_id,
                u => u.addTweets(statuses),
            );
        case 'AppendPastItems':
            const items = action.items;
            return state.modifyUserTimeline(
                action.user_id,
                u => u.appendPastItems(items),
            );
        // TODO: Add the user's tweet received from user stream
        case 'CloseSlaveTimeline':
            return state.closeCurrentTimeline();
        case 'BackSlaveTimeline':
            return state.backToPreviousTimeline();
        case 'FocusSlaveNext':
            return state.modifySlaveTimeline(s => s.focusNext());
        case 'FocusSlavePrev':
            return state.modifySlaveTimeline(s => s.focusPrev());
        case 'FocusSlaveTop':
            return state.modifySlaveTimeline(s => s.focusTop());
        case 'FocusSlaveBottom':
            return state.modifySlaveTimeline(s => s.focusBottom());
        case 'FocusSlaveOn':
            const index = action.index;
            return state.modifySlaveTimeline(s => s.focusOn(index));
        case 'BlurSlaveTimeline':
            return state.modifySlaveTimeline(s => s.blur());
        default:
            return state;
    }
}
