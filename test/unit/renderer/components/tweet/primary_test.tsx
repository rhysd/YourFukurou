import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import TweetPrimary from '../../../../../renderer/components/tweet/primary';
import TweetText from '../../../../../renderer/components/tweet/text';
import QuotedTweet from '../../../../../renderer/components/tweet/quote';
import TweetMedia from '../../../../../renderer/components/tweet/media';

test('display text and created date', t => {
    const tw = fixture.tweet();
    const c = shallow(
        <TweetPrimary owner={fixture.user()} status={tw} focused={false} />
    );
    t.true(c.find(TweetText).length > 0);
    const date = c.find('.tweet__primary-created-at');
    t.true(date.length > 0);
    t.true(date.at(0).text().indexOf(tw.getCreatedAtString()) !== -1);
});

test('action buttons are not displayed by default', t => {
    const c = shallow(
        <TweetPrimary owner={fixture.user()} status={fixture.tweet()} focused={false} />
    );
    const a = c.find('.tweet-actions');
    t.is(a.props().style.display, 'none');
});

test('action buttons are displayed when focused', t => {
    const c = shallow(
        <TweetPrimary owner={fixture.user()} status={fixture.tweet()} focused />
    );
    const a = c.find('.tweet-actions');
    t.is(a.props().style.display, 'flex');
});

test('quoted status is shown', t => {
    const c = shallow(
        <TweetPrimary owner={fixture.user()} status={fixture.quote()} focused={false}/>
    );
    t.is(c.find(QuotedTweet).length, 1);
});

test('show pictures in tweet', t => {
    const c = shallow(
        <TweetPrimary owner={fixture.user()} status={fixture.media()} focused={false}/>
    );
    t.is(c.find(TweetMedia).length, 1);
});

test('show conversation badge for in-reply-to status', t => {
    const c = shallow(
        <TweetPrimary owner={fixture.user()} status={fixture.in_reply_to()} focused={false}/>
    );
    t.true(c.find('.fa.fa-comments').length > 0);
});
