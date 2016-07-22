import {EditorState} from 'draft-js';
import Action, {ThunkAction} from './type';
import KeymapTransition from '../keybinds/keymap_transition';
import Tweet, {TwitterUser} from '../item/tweet';

export function changeEditorState(editor: EditorState): Action {
    return {
        type: 'ChangeEditorState',
        editor,
    };
}

export function selectAutoCompleteSuggestion(text: string, query: string): Action {
    return {
        type: 'SelectAutoCompleteSuggestion',
        text,
        query,
    };
}

export function openEditor(text?: string): ThunkAction {
    return dispatch => {
        KeymapTransition.enterEditor();
        dispatch({
            type: 'OpenEditor',
            text,
        });
    };
}

export function openEditorForReply(in_reply_to: Tweet, owner: TwitterUser, text?: string): ThunkAction {
    return dispatch => {
        KeymapTransition.enterEditor();
        dispatch({
            type: 'OpenEditorForReply',
            status: in_reply_to,
            user: owner,
            text,
        });
    };
}

export function closeEditor(): ThunkAction {
    return (dispatch, getState) => {
        KeymapTransition.escapeFromCurrentKeymaps(getState());
        dispatch({
            type: 'CloseEditor',
        });
    };
}

export function toggleEditor(): ThunkAction {
    return (dispatch, getState) => (
        getState().editor.is_open ? closeEditor : openEditor
    )()(dispatch, getState);
}

