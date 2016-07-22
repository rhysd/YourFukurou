import Action from '../actions/type';

export type MessageKind = 'info' | 'error';
export interface MessageState {
    readonly text: string;
    readonly kind: MessageKind;
}

export default function message(state: MessageState | null = null, action: Action): MessageState | null {
    switch (action.type) {
        case 'ShowMessage':
            return {
                text: action.text,
                kind: action.msg_kind,
            };
        case 'DismissMessage':
            return null;
        case 'NotImplementedYet':
            return {
                text: 'Sorry, this feature is not implemented yet.',
                kind: 'error',
            };
        default:
            return state;
    }
}
