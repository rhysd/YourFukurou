import {fixture} from '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
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
function renderTimeline(msg: MessageState = null, overlay: boolean = false, dispatch: (a: any) => void = doNothing) {
    return shallow(
        <Timeline
            message={msg}
            kind="home"
            items={List<Item>([fixture.tweet()])}
            owner={fixture.user()}
            media={{is_open: false} as any}
            focus_index={null}
            friends={List<number>()}
            overlay={overlay}
            dispatch={dispatch}
        />
    );
}

test('render infinite list with <ReactList/>', t => {
    const c = renderTimeline();
    const l = c.find(ReactList);
    t.is(l.length, 1);
    t.is(l.props().length, 1);
    t.is(c.find('.timeline__overlay').length, 0);
});

test('render <Message/> when message is set', t => {
    const c = renderTimeline({kind: 'info', text: 'This is text'});
    const msg = c.find(Message);
    t.is(msg.length, 1);
    t.is(msg.props().kind, 'info');
    t.is(msg.props().text, 'This is text');
});

test('can render overlay', t => {
    const cb = spy();
    const c = renderTimeline(null, true, cb);
    const overlay = c.find('.timeline__overlay');
    t.is(overlay.length, 1);
    overlay.simulate('click', {stopPropagation: doNothing});
    t.true(cb.called);
    const thunk = cb.args[0][0];
    const dispatch = spy();
    thunk(dispatch);
    t.is(dispatch.args[0][0].type, 'CloseSlaveTimeline');
});

test('put Lightbox', t => {
    const c = renderTimeline();
    t.is(c.find(Lightbox).length, 1);
});
