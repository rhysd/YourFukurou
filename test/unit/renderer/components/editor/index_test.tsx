import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {Editor, EditorState, ContentState} from 'draft-js';
import {List} from 'immutable';
import {TweetEditor} from '../../../../../renderer/components/editor/index';
import IconButton from '../../../../../renderer/components/icon_button';
import {DefaultEditorCompletionState} from '../../../../../renderer/states/editor_completion';
import TweetText from '../../../../../renderer/components/tweet/text';
import Tweet from '../../../../../renderer/item/tweet';

function doNothing() {
    // Do nothing
}

function getDefaultProps() {
    return {
        editor: EditorState.createEmpty(),
        inReplyTo: null as Tweet,
        completion: DefaultEditorCompletionState,
        user: fixture.user(),
        friends: List<number>(),
        dispatch: doNothing,
    };
}

test('show editor UIs', t => {
    const c = shallow(
        <TweetEditor
            {...getDefaultProps()}
        />
    );
    t.is(c.find(Editor).length, 1);
    const btns = c.find(IconButton);
    t.true(btns.length > 0);
    t.is(btns.at(0).props().tip, 'cancel');
    t.is(btns.at(1).props().tip, 'send tweet');
});

test('show tweet text on creating in-reply-to status', t => {
    const props = getDefaultProps();
    props.inReplyTo = fixture.tweet();
    const c = shallow(<TweetEditor {...props}/>);
    const irt = c.find(TweetText);
    t.is(irt.length, 1);
    t.is(irt.props().status.id, fixture.tweet().id);
});

test("'send tweet' button is inactive by default", t => {
    const c = shallow(
        <TweetEditor
            {...getDefaultProps()}
        />
    );
    t.is(c.find('.tweet-form__send-btn_inactive').length, 1);
});

test("'send tweet' button is active on input", t => {
    const props = getDefaultProps();
    props.editor = EditorState.createWithContent(
        ContentState.createFromText('This is text')
    );
    const c = shallow(<TweetEditor {...props}/>);
    t.is(c.find('.tweet-form__send-btn_active').length, 1);
});



