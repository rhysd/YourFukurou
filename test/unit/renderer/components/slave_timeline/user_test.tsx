import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import UserSlave from '../../../../../renderer/components/slave_timeline/user';
import {UserTimeline} from '../../../../../renderer/states/slave_timeline';
import TwitterProfile from '../../../../../renderer/components/tweet/profile';
import Item from '../../../../../renderer/item/item';
import Tweet from '../../../../../renderer/components/tweet/index';

test('show profile of the user', t => {
    const u = fixture.user();
    const tl = new UserTimeline(u);
    const c = shallow(
        <UserSlave
            timeline={tl}
            owner={u}
            friends={List<number>()}
        />
    );

    const p = c.find(TwitterProfile);
    t.is(p.length, 1);
    t.is(p.props().user.id, u.id);
    t.is(p.props().size, 'big');
});

test('show tweets in user timeline', t => {
    const u = fixture.user();
    const tw = fixture.tweet();
    const tl = new UserTimeline(u, List<Item>([tw, tw, tw]));
    const c = shallow(
        <UserSlave
            timeline={tl}
            owner={u}
            friends={List<number>()}
        />
    );

    const tweets = c.find(Tweet);
    t.is(tweets.length, 3);
    t.is(tweets.at(0).props().status.id, tw.id);
    t.is(tweets.at(1).props().status.id, tw.id);
    t.is(tweets.at(2).props().status.id, tw.id);
});
