import '../../helper';
import test from 'ava';
import {DefaultEditorCompletionState} from '../../../../renderer/states/editor_completion';
// import {SuggestionItem} from '../../../../renderer/components/editor/suggestions';

test('Default value is set to null', t => {
    t.is(DefaultEditorCompletionState.label, null);
});

test('searchSuggestions() set the search result', t => {
    const s1 = DefaultEditorCompletionState.searchSuggestions([], 'foo', 42, 42, 'EMOJI');
    t.is(s1.label, null);
    t.is(s1.suggestions.length, 0);

    const items = [
        {code: 'dog', description: ':dog:'},
        {code: 'cat', description: ':cat:'},
    ];
    const s2 = DefaultEditorCompletionState.searchSuggestions(items, ':do', 42, 21, 'EMOJI');
    t.is(s2.suggestions.length, 2);
    t.is(s2.suggestions[0].code, 'dog');
    t.is(s2.suggestions[1].code, 'cat');
    t.is(s2.label, 'EMOJI');
    t.is(s2.pos_top, 42);
    t.is(s2.pos_left, 21);
});
