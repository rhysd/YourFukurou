import {fixture} from '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import {TwitterActivity} from '../../../../renderer/components/activity';
import Icon from '../../../../renderer/components/icon';
import TimelineActivity from '../../../../renderer/item/timeline_activity';

function doNothing() {
    // Do nothing
}

function likedActivity() {
    return new TimelineActivity(
        'liked',
        fixture.tweet(),
        [fixture.user()]
    );
}

function retweetedActivity() {
    return new TimelineActivity(
        'retweeted',
        fixture.tweet(),
        [fixture.user()]
    );
}

test('show liked activity', t => {
    const a = shallow(
        <TwitterActivity activity={likedActivity()} onClick={doNothing}/>
    );
    t.true(a.find('.fa.fa-heart').length > 0);
    const by = a.find(Icon);
    t.true(by.length > 0);
    t.is(by.props().user.screen_name, 'Linda_pp');
    const h = a.find('.activity__header');
    t.is(h.length, 1);
    t.true(h.text().indexOf('Liked by') !== -1);
    t.is(a.find('.activity_mini').length, 0);
});

test('show retweeted activity', t => {
    const a = shallow(
        <TwitterActivity activity={retweetedActivity()} onClick={doNothing}/>
    );
    t.true(a.find('.fa.fa-retweet').length > 0);
    const by = a.find(Icon);
    t.true(by.length > 0);
    t.is(by.props().user.screen_name, 'Linda_pp');
    const h = a.find('.activity__header');
    t.is(h.length, 1);
    t.true(h.text().indexOf('Retweeted by') !== -1);
});

test('show focused activity', t => {
    const a = shallow(
        <TwitterActivity activity={likedActivity()} onClick={doNothing} focused/>
    );
    t.true(a.find('.activity_focused').length > 0);
    const a2 = shallow(
        <TwitterActivity activity={retweetedActivity()} onClick={doNothing} focused collapsed/>
    );
    t.true(a2.find('.activity_focused').length > 0);
});

test('show collapsed activity', t => {
    const a = shallow(
        <TwitterActivity activity={likedActivity()} onClick={doNothing} collapsed/>
    );
    t.true(a.find('.activity_mini').length > 0);
    t.true(a.find('.fa.fa-heart').length > 0);
    const by = a.find(Icon);
    t.true(by.length > 0);
    t.is(by.props().user.screen_name, 'Linda_pp');
});

test('fire onClick', t => {
    let cb = spy();
    const a = shallow(
        <TwitterActivity activity={likedActivity()} onClick={cb}/>
    );
    a.simulate('click');
    t.true(cb.called);

    cb = spy();
    const a2 = shallow(
        <TwitterActivity activity={likedActivity()} collapsed onClick={cb}/>
    );
    a2.simulate('click');
    t.true(cb.called);
});
