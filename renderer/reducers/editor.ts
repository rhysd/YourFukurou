import {Action, Kind} from '../actions';
import TweetEditorState from '../states/tweet_editor';

export default function editor(state: TweetEditorState = new TweetEditorState(), action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.ChangeEditorState:            return state.onDraftEditorChange(action.editor);
        case Kind.SelectAutoCompleteSuggestion: return state.onSelect(action.query, action.text);
        case Kind.OpenEditor:                   return state.openEditor(action.status);
        case Kind.CloseEditor:                  return state.closeEditor();
        case Kind.ToggleEditor:                 return state.toggleEditor(action.status);
        case Kind.UpdateStatus:                 return state.clearEditor();
        default:                                return state;
    }
}

