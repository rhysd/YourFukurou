import {Action, Kind} from '../actions';
import EditorCompletionState from '../states/editor_completion';

export default function editorCompletion(state: EditorCompletionState = new EditorCompletionState(), action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.UpdateAutoCompletion:
            return state.searchSuggestions(
                action.suggestions,
                action.query,
                action.top,
                action.left,
                action.completion_label
            );
        case Kind.DownAutoCompletionFocus:      return state.downFocus();
        case Kind.UpAutoCompletionFocus:        return state.upFocus();
        case Kind.StopAutoCompletion:           return new EditorCompletionState();
        case Kind.SelectAutoCompleteSuggestion: return new EditorCompletionState();
        default:                                return state;
    }
}

