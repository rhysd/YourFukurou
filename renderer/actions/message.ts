import Action, {ThunkAction} from './type';
import {MessageKind} from '../reducers/message';

export function showMessage(text: string, msg_kind: MessageKind): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'ShowMessage',
            text,
            msg_kind,
        }));
    };
}

export function dismissMessage(): Action {
    return {
        type: 'DismissMessage',
    };
}

export function notImplementedYet(): ThunkAction {
    return dispatch => {
        window.requestIdleCallback(() => dispatch({
            type: 'NotImplementedYet',
        }));
    };
}

