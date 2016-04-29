import {Action, Kind} from '../actions';
import EditorCompletionState from '../states/editor_completion';

export default function editorCompletion(state: EditorCompletionState = new EditorCompletionState(), action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.UpdateAutoCompletion:
            return state.searchSuggestions(
                action.query,
                action.completion_label,
                action.top,
                action.left
            );
        case Kind.DownAutoCompletionFocus:      return state.downFocus();
        case Kind.UpAutoCompletionFocus:        return state.upFocus();
        case Kind.StopAutoCompletion:           return new EditorCompletionState();
        case Kind.SelectAutoCompleteSuggestion: return new EditorCompletionState();
        default:                                return state;
    }
}

