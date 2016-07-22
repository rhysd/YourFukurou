import Action from '../actions/type';
import EditorCompletionState, {DefaultEditorCompletionState} from '../states/editor_completion';

export default function editorCompletion(state: EditorCompletionState = DefaultEditorCompletionState, action: Action) {
    switch (action.type) {
        case 'UpdateAutoCompletion':
            return state.searchSuggestions(
                action.suggestions,
                action.query,
                action.top,
                action.left,
                action.completion_label,
            );
        case 'DownAutoCompletionFocus':      return state.downFocus();
        case 'UpAutoCompletionFocus':        return state.upFocus();
        case 'StopAutoCompletion':           return DefaultEditorCompletionState;
        case 'SelectAutoCompleteSuggestion': return DefaultEditorCompletionState;
        default:                             return state;
    }
}

