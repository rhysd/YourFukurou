import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import QuotedTweet from '../../../../../renderer/components/tweet/quote';
import TweetText from '../../../../../renderer/components/tweet/text';
import ScreenName from '../../../../../renderer/components/tweet/screen_name';
import {shell} from 'electron';

test('displays tweet text with screen name of author', t => {
    const c = shallow(<QuotedTweet status={fixture.tweet()} focused={false}/>);
    t.true(c.find('.fa.fa-quote-left').length > 0);
    t.is(c.find(TweetText).length, 1);
    const sn = c.find(ScreenName);
    t.true(sn.length > 0);
    t.is(sn.at(0).props().user.id, fixture.tweet().user.id);
});

test('quoted status can be focused', t => {
    const c = shallow(<QuotedTweet status={fixture.tweet()} focused/>);
    t.true(c.find('.tweet__quoted_focused').length > 0);
});

test('opens quoted status in browser on quote icon clicked', t => {
    const openExternal = shell.openExternal as any;
    openExternal.called = false;
    const tw = fixture.tweet();
    const c = shallow(<QuotedTweet status={tw} focused={false}/>);
    const q = c.find('.tweet__quoted-icon');
    t.is(q.length, 1);
    q.simulate('click', {
        stopPropagation() { /* do nothing */ },
    });
    t.true(openExternal.called);
    t.is(openExternal.args[openExternal.args.length - 1][0], `https://twitter.com/${tw.user.screen_name}/status/${tw.id}`);
});
