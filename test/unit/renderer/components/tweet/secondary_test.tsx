import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import TweetSecondary from '../../../../../renderer/components/tweet/secondary';
import ScreenName from '../../../../../renderer/components/tweet/screen_name';

test('display screen name', t => {
    const c = shallow(<TweetSecondary status={fixture.tweet()}/>);
    t.true(c.find(ScreenName).length > 0);
    t.is(c.find('.tweet__secondary-retweetedby').length, 0);
});

test('display user name', t => {
    const name = fixture.tweet().user.name;
    const c = shallow(<TweetSecondary status={fixture.tweet()}/>);
    t.true(c.text().indexOf(name) !== -1);
});

test('display retweeted user for retweet', t => {
    const rt = fixture.retweet();
    const c = shallow(<TweetSecondary status={rt}/>);
    t.is(c.find('.fa.fa-retweet').length, 1);
    const s = c.find('.tweet__secondary-retweetedby').find(ScreenName);
    t.true(s.length > 0);
    t.is(s.props().user.id, rt.user.id);
});

test('can be focused', t => {
    const c = shallow(<TweetSecondary status={fixture.tweet()} focused/>);
    t.true(c.find('.tweet__secondary-screenname_focused').length > 0);
});
