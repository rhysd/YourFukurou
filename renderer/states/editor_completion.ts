import {AutoCompleteLabel} from '../components/editor/auto_complete_decorator';
import {searchSuggestionItems, SuggestionItem} from '../components/editor/suggestions';

export default class EditorCompletionState {
    constructor(
        public query: string = null,
        public label: AutoCompleteLabel = null,
        public pos_top: number = 0,
        public pos_left: number = 0,
        public suggestions: SuggestionItem[] = [],
        public focus_idx: number = null
    ) {
    }

    searchSuggestions(suggestions: SuggestionItem[], query: string, top: number, left: number, label: AutoCompleteLabel) {
        if (suggestions.length === 0) {
            // Note:
            // Close completion on no suggestion
            return new EditorCompletionState(
                query,
                null,
                top,
                left,
                suggestions,
                null
            );
        }
        return new EditorCompletionState(
            query,
            label,
            top,
            left,
            suggestions,
            this.focus_idx
        );
    }

    cloneWithFocusIdx(new_id: number) {
        return new EditorCompletionState(
            this.query,
            this.label,
            this.pos_top,
            this.pos_left,
            this.suggestions,
            new_id
        );
    }

    downFocus() {
        if (this.label === null) {
            return this;
        }
        const i = this.focus_idx;
        const next_idx =
            i === null || i >= this.suggestions.length - 1 ?
                0 : i + 1;
        return this.cloneWithFocusIdx(next_idx);
    }

    upFocus() {
        if (this.label === null) {
            return this;
        }
        const i = this.focus_idx;
        const next_idx =
            i === null || i <= 0 ?
                this.suggestions.length - 1 :
                i - 1;
        return this.cloneWithFocusIdx(next_idx);
    }
}
