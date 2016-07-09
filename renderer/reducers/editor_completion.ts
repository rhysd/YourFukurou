import {Action, Kind} from '../actions';
import EditorCompletionState, {DefaultEditorCompletionState} from '../states/editor_completion';

export default function editorCompletion(state: EditorCompletionState = DefaultEditorCompletionState, action: Action) {
    switch (action.type) {
        case Kind.UpdateAutoCompletion:         return action.next_completion;
        case Kind.DownAutoCompletionFocus:      return action.next_completion;
        case Kind.UpAutoCompletionFocus:        return action.next_completion;
        case Kind.StopAutoCompletion:           return DefaultEditorCompletionState;
        case Kind.SelectAutoCompleteSuggestion: return DefaultEditorCompletionState;
        default:                                return state;
    }
}

