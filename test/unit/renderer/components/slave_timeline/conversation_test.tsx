import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import ConversationSlave from '../../../../../renderer/components/slave_timeline/conversation';
import {ConversationTimeline} from '../../../../../renderer/states/slave_timeline';
import Tweet from '../../../../../renderer/components/tweet/index';

test('show tweets in the conversation', t => {
    const tw = fixture.tweet();
    const tl = ConversationTimeline.fromArray([tw, tw, tw]);
    const c = shallow(
        <ConversationSlave
            timeline={tl}
            owner={fixture.user()}
            friends={List<number>()}
        />
    );
    const tweets = c.find(Tweet);
    t.is(tweets.length, 3);
    t.is(tweets.at(0).props().status.id, tw.id);
});
