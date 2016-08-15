import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import {spy} from 'sinon';
import {SlaveTimelineWrapper} from '../../../../../renderer/components/slave_timeline/index';
import UserSlave from '../../../../../renderer/components/slave_timeline/user';
import ConversationSlave from '../../../../../renderer/components/slave_timeline/conversation';
import SlaveTimelineState, {SlaveTimeline, ConversationTimeline, UserTimeline} from '../../../../../renderer/states/slave_timeline';

function getSlaveTimelineOf(...ts: SlaveTimeline[]) {
    return new SlaveTimelineState(List<SlaveTimeline>(ts));
}

test('user timeline is shown in slave timeline', t => {
    const u = fixture.user();
    const tl = getSlaveTimelineOf(new UserTimeline(u));
    const c = shallow(
        <SlaveTimelineWrapper
            slave={tl}
            owner={u}
            friends={List<number>()}
        />
    );
    const w = c.find('.slave-timeline__timeline');
    t.is(w.length, 1);
    t.is(w.find(UserSlave).length, 1);
});

test('conversation timeline is shown in slave timeline', t => {
    const u = fixture.user();
    const tw = fixture.tweet_other();
    const tl = getSlaveTimelineOf(ConversationTimeline.fromArray([tw, tw, tw]));
    const c = shallow(
        <SlaveTimelineWrapper
            slave={tl}
            owner={u}
            friends={List<number>()}
        />
    );
    const w = c.find('.slave-timeline__timeline');
    t.is(w.length, 1);
    t.is(w.find(ConversationSlave).length, 1);
});

test('overlay is shown and will close slave timeline when it is clicked', t => {
    const u = fixture.user();
    const tl = getSlaveTimelineOf(new UserTimeline(u));
    const cb = spy();
    const c = shallow(
        <SlaveTimelineWrapper
            slave={tl}
            owner={u}
            friends={List<number>()}
            dispatch={cb}
        />
    );
    const overlay = c.find('.slave-timeline__overlay');
    t.is(overlay.length, 1);

    overlay.simulate('click', {
        stopPropagation() { /* do nothing */ },
    });
    t.true(cb.called);

    const thunk = cb.args[0][0];
    t.not(thunk, undefined);
    const dispatch = spy();
    thunk(dispatch, () => ({}));
    t.true(dispatch.called);
    const action = dispatch.args[0][0];
    t.is(action.type, 'CloseSlaveTimeline');
});

test('Header text and back button is shown', t => {
    const u = fixture.user();
    const tl = getSlaveTimelineOf(new UserTimeline(u));
    const cb = spy();
    const c = shallow(
        <SlaveTimelineWrapper
            slave={tl}
            owner={u}
            friends={List<number>()}
            dispatch={cb}
        />
    );
    const header = c.find('.slave-timeline__header');
    t.is(header.length, 1);

    const title = header.find('.slave-timeline__title');
    t.is(header.length, 1);
    t.is(title.text(), `Profile: @${u.screen_name}`);

    const back = header.find('.slave-timeline__back');
    t.is(back.length, 1);
    back.simulate('click', {
        stopPropagation() { /* do nothing */ },
    });
    t.true(cb.called);

    const thunk = cb.args[0][0];
    t.not(thunk, undefined);
    const dispatch = spy();
    const getState = () => ({});
    thunk(dispatch, getState);
    t.true(dispatch.called);
    const action = dispatch.args[0][0];
    t.is(action.type, 'CloseSlaveTimeline');
});
