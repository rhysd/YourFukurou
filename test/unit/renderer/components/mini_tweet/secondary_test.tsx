import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import MiniTweetSecondary from '../../../../../renderer/components/mini_tweet/secondary';
import ScreenName from '../../../../../renderer/components/tweet/screen_name';

test('show screen name', t => {
    const tw = fixture.tweet();
    const c = shallow(
        <MiniTweetSecondary status={tw} focused={false}/>
    );
    const sn = c.find(ScreenName);
    t.true(sn.length > 0);
    t.is(sn.props().user.id, tw.user.id);
});

test('show 2cols on quoted status', t => {
    const tw = fixture.quote();
    const c = shallow(
        <MiniTweetSecondary status={tw} focused={false}/>
    );
    t.true(c.find('.mini-tweet__secondary_2cols').length > 0);
});

test('can be focused', t => {
    const c = shallow(
        <MiniTweetSecondary status={fixture.tweet()} focused/>
    );
    t.true(c.find('.mini-tweet__secondary').length > 0);
});

test('show retweeted user', t => {
    const rt = fixture.retweet();
    const c = shallow(
        <MiniTweetSecondary status={rt} focused={false}/>
    );
    t.true(c.find('.fa.fa-retweet').length > 0);
    const img = c.find('.mini-tweet__secondary-rt-image');
    t.is(img.props().alt, '@' + rt.user.screen_name);
});
