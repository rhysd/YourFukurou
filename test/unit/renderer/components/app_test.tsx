import '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import Message from '../../../../renderer/components/message';
import SideMenu from '../../../../renderer/components/side_menu';
import TweetEditor from '../../../../renderer/components/editor/index';
import SlaveTimeline from '../../../../renderer/components/slave_timeline/index';
import Timeline from '../../../../renderer/components/timeline';
import {App} from '../../../../renderer/components/app';
import {MessageState} from '../../../../renderer/reducers/message';

function nop() { /* Do nothing */ }

function renderApp(editorOpen: boolean = false, slaveOpen: boolean = false, message: MessageState = null) {
    return shallow(
        <App
            editorOpen={editorOpen}
            slaveOpen={slaveOpen}
            message={message}
            dispatch={nop}
        />
    );
}

test('always render side menu and timeline', t => {
    const c = renderApp();
    const m = c.find(SideMenu);
    t.is(m.length, 1);
    const tl = c.find(Timeline);
    t.is(tl.length, 1);
});

test('render tweet editor if needed', t => {
    const c = renderApp(false);
    const m = c.find(TweetEditor);
    t.is(m.length, 0);
    const c2 = renderApp(true);
    const m2 = c2.find(TweetEditor);
    t.is(m2.length, 1);
});

test('render slave timeline if needed', t => {
    const c = renderApp(false, false);
    const m = c.find(SlaveTimeline);
    t.is(m.length, 0);
    const c2 = renderApp(false, true);
    const m2 = c2.find(SlaveTimeline);
    t.is(m2.length, 1);
});

test('render <Message/> when message is set', t => {
    const m = {
        kind: 'error',
        text: 'This is error text',
    } as MessageState;
    const c = renderApp(false, false, m);
    const msg = c.find(Message);
    t.is(msg.length, 1);
    t.is(msg.props().kind, 'error');
    t.is(msg.props().text, 'This is error text');
});

