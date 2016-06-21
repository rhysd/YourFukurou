import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import TweetText from '../../../../../renderer/components/tweet/text';
import ExternalLink from '../../../../../renderer/components/external_link';

test('include mention link', t => {
    const tw = fixture.in_reply_to();
    const mention = tw.mentions[0];
    const c = shallow(<TweetText status={tw} />);
    const links = c.find(ExternalLink);
    const link = links.filterWhere(l => l.props().title === mention.name).at(0);
    t.true(link.length > 0);
    t.is(link.props().url, 'https://twitter.com/' + mention.screen_name);
    t.true(link.props().className.indexOf('mention') !== -1);
});

test('include hashtag link', t => {
    const tw = fixture.retweet_media().getMainStatus();
    const hashtag = tw.hashtags[0];
    const c = shallow(<TweetText status={tw} />);
    const url = `https://twitter.com/hashtag/${hashtag.text}?src=hash`;
    const links = c.find(ExternalLink).filterWhere(l => l.props().url === url);
    t.is(links.length, 1);
    t.true(links.at(0).props().className.indexOf('hashtag') !== -1);
});

test('include link to URL in text', t => {
    const tw = fixture.retweet_media().getMainStatus();
    const urls = tw.urls;
    const c = shallow(<TweetText status={tw} />);
    const url = urls[0].expanded_url;
    const links = c.find(ExternalLink).filterWhere(l => l.props().url === url);
    t.is(links.length, 1);
    t.true(links.at(0).props().className.indexOf('url') !== -1);
});

test('allows custom class name', t => {
    const c = shallow(<TweetText status={fixture.tweet()} className="my-class"/>);
    t.true(c.find('.my-class').length > 0);
});

test('links consider focus state', t => {
    const c = shallow(<TweetText status={fixture.in_reply_to()} className="my-class" focused/>);
    t.true(c.find('.my-class-mention_focused').length > 0);
});
