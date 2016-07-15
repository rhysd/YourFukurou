import '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import Suggestions, {SuggestionItem, EmojiEntry, ScreenNameEntry, HashtagEntry} from '../../../../../renderer/components/editor/suggestions';
import {AutoCompleteLabel} from '../../../../../renderer/components/editor/auto_complete_decorator';
import EditorCompletionState from '../../../../../renderer/states/editor_completion';

const Item = {
    code: ':code:',
    icon_url: 'https://example.com/icon',
    description: 'This is description',
} as SuggestionItem;

function emptyState(label: AutoCompleteLabel | null = null, items: SuggestionItem[] = [Item], focus: number | null = null) {
    return new EditorCompletionState('', label, 0, 0, items, focus);
}

test('show emoji completion result', t => {
    const s = emptyState('EMOJI');
    const c = shallow(<Suggestions {...s}/>);
    const e = c.find(EmojiEntry);
    t.true(e.length > 0);
    t.is(e.props().code, ':code:');
});

test('show screen name completion result', t => {
    const s = emptyState('SCREENNAME');
    const c = shallow(<Suggestions {...s}/>);
    const sn = c.find(ScreenNameEntry);
    t.true(sn.length > 0);
    t.is(sn.props().name, 'This is description');
    t.is(sn.props().icon_url, 'https://example.com/icon');
});

test('show hashtag completion result', t => {
    const s = emptyState('HASHTAG');
    const c = shallow(<Suggestions {...s}/>);
    const h = c.find(HashtagEntry);
    t.true(h.length > 0);
    t.is(h.props().text, 'This is description');
});

test('handle focused completion item', t => {
    const s = emptyState('EMOJI', [Item, Item, Item], 1);
    const c = shallow(<Suggestions {...s}/>);
    const e = c.find(EmojiEntry);
    t.is(e.length, 3);
    t.false(e.at(0).props().focused);
    t.true(e.at(1).props().focused);
    t.false(e.at(2).props().focused);
});

