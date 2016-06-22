import '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import Suggestions, {SuggestionItem, EmojiEntry, ScreenNameEntry, HashtagEntry} from '../../../../../renderer/components/editor/suggestions';
import EditorCompletionState from '../../../../../renderer/states/editor_completion';
import {Kind, Action} from '../../../../../renderer/actions';

const Item = {
    code: ':code:',
    icon_url: 'https://example.com/icon',
    description: 'This is description',
} as SuggestionItem;

function emptyState() {
    return new EditorCompletionState('', null, 0, 0, [Item], null);
}

test('show emoji completion result', t => {
    const s = emptyState();
    s.label = 'EMOJI';
    const c = shallow(<Suggestions {...s}/>);
    const e = c.find(EmojiEntry);
    t.true(e.length > 0);
    t.is(e.props().code, ':code:');
});

test('show screen name completion result', t => {
    const s = emptyState();
    s.label = 'SCREENNAME';
    const c = shallow(<Suggestions {...s}/>);
    const sn = c.find(ScreenNameEntry);
    t.true(sn.length > 0);
    t.is(sn.props().name, 'This is description');
    t.is(sn.props().icon_url, 'https://example.com/icon');
});

test('show hashtag completion result', t => {
    const s = emptyState();
    s.label = 'HASHTAG';
    const c = shallow(<Suggestions {...s}/>);
    const h = c.find(HashtagEntry);
    t.true(h.length > 0);
    t.is(h.props().text, 'This is description');
});

test('handle focused completion item', t => {
    const s = emptyState();
    s.label = 'EMOJI';
    s.suggestions = [Item, Item, Item];
    s.focus_idx = 1;
    const c = shallow(<Suggestions {...s}/>);
    const e = c.find(EmojiEntry);
    t.is(e.length, 3);
    t.false(e.at(0).props().focused);
    t.true(e.at(1).props().focused);
    t.false(e.at(2).props().focused);
});

