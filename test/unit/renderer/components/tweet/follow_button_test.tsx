import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import {spy} from 'sinon';
import {FollowButton} from '../../../../../renderer/components/tweet/follow_button';

function doNothing() {
    // Do nothing
}

test.beforeEach(t => {
    t.context.user = fixture.user();
    t.context.protected = t.context.user.json.protected;
});

test.afterEach(t => {
    t.context.user.json.protected = t.context.protected;
});

test('show "Follow" button if target is not a follower', t => {
    const c = shallow(
        <FollowButton
            user={t.context.user}
            friends={List<number>()}
            onClick={doNothing}
        />
    );
    t.is(c.text(), 'Follow');
    t.true(c.find('.follow-button_will-follow').length > 0);
});

test('show "Unfollow" button if target is a follower', t => {
    const c = shallow(
        <FollowButton
            user={t.context.user}
            friends={List<number>([t.context.user.id])}
            onClick={doNothing}
        />
    );
    t.is(c.text(), 'Unfollow');
    t.true(c.find('.follow-button_will-unfollow').length > 0);
});

test('cannot follow if target is a protected user', t => {
    t.context.user.json.protected = true;
    const c = shallow(
        <FollowButton
            user={t.context.user}
            friends={List<number>()}
            onClick={doNothing}
        />
    );
    t.true(c.find('.follow-button_cannot-follow').length > 0);
});

test('fires onClick', t => {
    const cb = spy();
    const c = shallow(
        <FollowButton
            user={t.context.user}
            friends={List<number>()}
            onClick={cb}
        />
    );
    c.simulate('click');
    t.true(cb.called);
});
