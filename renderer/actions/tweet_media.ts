import Action, {ThunkAction} from './type';
import KeymapTransition from '../keybinds/keymap_transition';

export function openPicturePreview(media_urls: string[], index?: number): ThunkAction {
    return dispatch => {
        KeymapTransition.enterMediaPreview();
        dispatch({
            type: 'OpenPicturePreview',
            media_urls,
            index,
        });
    };
}

export function closeTweetMedia(): ThunkAction {
    return (dispatch, getState) => {
        KeymapTransition.escapeFromCurrentKeymaps(getState());
        dispatch({
            type: 'CloseTweetMedia',
        });
    };
}

export function moveToNthPicturePreview(index: number): Action {
    return {
        type: 'MoveToNthPicturePreview',
        index,
    };
}

