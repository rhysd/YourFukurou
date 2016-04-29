import assign = require('object-assign');
import {Action, Kind} from '../actions';
import {AutoCompleteLabel} from '../components/editor/auto_complete_decorator';
import {searchSuggestionItems, SuggestionItem} from '../components/editor/suggestions';

function resetCompletionState(s: EditorCompletionState) {
    'use strict';
    s.query = null;
    s.label = null;
    s.pos_left = 0;
    s.pos_top = 0;
    s.suggestions = [];
    s.focus_idx = null;
    return s;
}

export interface EditorCompletionState {
    query: string;
    label: AutoCompleteLabel;
    pos_top: number;
    pos_left: number;
    suggestions: SuggestionItem[];
    focus_idx: number;
}

const InitEditorCompletionState: EditorCompletionState = {
    query: null,
    label: null,
    pos_top: 0,
    pos_left: 0,
    suggestions: [],
    focus_idx: null,
};

export default function editorCompletion(state: EditorCompletionState = InitEditorCompletionState, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.UpdateAutoCompletion: {
            const next_state = assign({}, state) as EditorCompletionState;
            if (action.query === state.query) {
                // When overlapping queries, it means that completion was done.
                return resetCompletionState(next_state);
            }
            next_state.query = action.query;
            next_state.label = action.completion_label;
            next_state.pos_left = action.left;
            next_state.pos_top = action.top;
            next_state.suggestions = searchSuggestionItems(action.query, action.completion_label);
            return next_state;
        }
        case Kind.DownAutoCompletionFocus: {
            if (state.label === null) {
                // Note: Suggestion not being selected
                return state;
            }
            const next_state = assign({}, state) as EditorCompletionState;
            const i = state.focus_idx;
            if (i === null || i >= state.suggestions.length - 1) {
                next_state.focus_idx = 0;
            } else {
                next_state.focus_idx = i + 1;
            }
            return next_state;
        }
        case Kind.UpAutoCompletionFocus: {
            if (state.label === null) {
                // Note: Suggestion not being selected
                return state;
            }
            const next_state = assign({}, state) as EditorCompletionState;
            const i = state.focus_idx;
            if (i === null || i <= 0) {
                next_state.focus_idx = state.suggestions.length - 1;
            } else {
                next_state.focus_idx = i - 1;
            }
            return next_state;
        }
        case Kind.StopAutoCompletion: {
            return resetCompletionState(assign({}, state) as EditorCompletionState);
        }
        case Kind.SelectAutoCompleteSuggestion: {
            return resetCompletionState(assign({}, state) as EditorCompletionState);
        }
        default: {
            return state;
        }
    }
}

