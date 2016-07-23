import {fixture} from '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import * as ReactList from 'react-list';
import Lightbox from 'react-images';
import Item from '../../../../renderer/item/item';
import {Timeline} from '../../../../renderer/components/timeline';
import Message from '../../../../renderer/components/message';
import {MessageState} from '../../../../renderer/reducers/message';

function doNothing(_: any) {
    // do nothing;
}

// XXX:
// Importing states/tweet_media.ts occurs an error in reducers/tweet_media.ts
// Error reports the state which tweetMedia() receives is undefined.
function renderTimeline(msg: MessageState = null, dispatch: (a: any) => void = doNothing) {
    return shallow(
        <Timeline
            message={msg}
            kind="home"
            items={List<Item>([fixture.tweet()])}
            owner={fixture.user()}
            media={{is_open: false} as any}
            focus_index={null}
            friends={List<number>()}
            dispatch={dispatch}
        />
    );
}

test('render infinite list with <ReactList/>', t => {
    const c = renderTimeline();
    const l = c.find(ReactList);
    t.is(l.length, 1);
    t.is(l.props().length, 1);
});

test('render <Message/> when message is set', t => {
    const c = renderTimeline({kind: 'info', text: 'This is text'});
    const msg = c.find(Message);
    t.is(msg.length, 1);
    t.is(msg.props().kind, 'info');
    t.is(msg.props().text, 'This is text');
});

test('put Lightbox', t => {
    const c = renderTimeline();
    t.is(c.find(Lightbox).length, 1);
});
