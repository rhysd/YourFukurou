import Kind from '../action_kinds';
import {Action} from '../actions';
import EditorCompletionState, {DefaultEditorCompletionState} from '../states/editor_completion';

export default function editorCompletion(state: EditorCompletionState = DefaultEditorCompletionState, action: Action) {
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
        case Kind.StopAutoCompletion:           return DefaultEditorCompletionState;
        case Kind.SelectAutoCompleteSuggestion: return DefaultEditorCompletionState;
        default:                                return state;
    }
}

