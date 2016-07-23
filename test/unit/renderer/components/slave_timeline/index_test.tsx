import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import {spy} from 'sinon';
import {SlaveTimelineWrapper} from '../../../../../renderer/components/slave_timeline/index';
import UserSlave from '../../../../../renderer/components/slave_timeline/user';
import ConversationSlave from '../../../../../renderer/components/slave_timeline/conversation';
import {ConversationTimeline, UserTimeline} from '../../../../../renderer/states/slave_timeline';

test('user timeline is shown in slave timeline', t => {
    const u = fixture.user();
    const tl = new UserTimeline(u);
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
    const tl = ConversationTimeline.fromArray([tw, tw, tw]);
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

test('Overlay is shown and will close slave timeline when it is clicked', t => {
    const u = fixture.user();
    const tl = new UserTimeline(u);
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

