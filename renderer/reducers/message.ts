import Kind from '../action_kinds';
import {Action} from '../actions';

export type MessageKind = 'info' | 'error';
export interface MessageState {
    text: string;
    kind: MessageKind;
}

export default function message(state: MessageState | null = null, action: Action): MessageState | null {
    switch (action.type) {
        case Kind.ShowMessage:
            return {
                text: action.text!,
                kind: action.msg_kind!,
            };
        case Kind.DismissMessage:
            return null;
        case Kind.NotImplementedYet:
            return {
                text: 'Sorry, this feature is not implemented yet.',
                kind: 'error',
            };
        default:
            return state;
    }
}
