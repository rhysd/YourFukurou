import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import {TweetActionButton} from '../../../../../renderer/components/tweet/action_button';
import IconButton from '../../../../../renderer/components/icon_button';

function doNothing() {
    // Do nothing;
}

test('show reply button', t => {
    const tw = fixture.tweet();
    const c = shallow(
        <TweetActionButton
            kind="reply"
            status={tw}
            owner={fixture.user()}
            onClick={doNothing}
        />
    );
    t.is(c.find('.tweet-actions__count').text(), '');
    const btn = c.find(IconButton);
    t.is(btn.props().name, 'reply');
    t.is(btn.props().tip, 'reply');
});

test('show retweet button', t => {
    const tw = fixture.tweet();
    tw.json.retweet_count = 42;
    const c = shallow(
        <TweetActionButton
            kind="retweet"
            status={tw}
            owner={fixture.user()}
            onClick={doNothing}
        />
    );
    t.is(c.find('.tweet-actions__count').text(), tw.json.retweet_count.toString());
    const btn = c.find(IconButton);
    t.is(btn.props().name, 'retweet');
    t.is(btn.props().tip, 'retweet');
});

test('show like button', t => {
    const tw = fixture.tweet();
    tw.json.favorite_count = 42;
    const c = shallow(
        <TweetActionButton
            kind="like"
            status={tw}
            owner={fixture.user()}
            onClick={doNothing}
        />
    );
    t.is(c.find('.tweet-actions__count').text(), tw.json.favorite_count.toString());
    const btn = c.find(IconButton);
    t.is(btn.props().name, 'heart');
    t.is(btn.props().tip, 'like');
});

test('fire onClick callback', t => {
    const cb = spy();
    const tw = fixture.tweet();
    const c = shallow(
        <TweetActionButton
            kind="reply"
            status={tw}
            owner={fixture.user()}
            onClick={cb}
        />
    );
    c.find(IconButton).simulate('click');
    t.true(cb.called);
});
