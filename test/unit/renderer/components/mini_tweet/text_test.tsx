import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import {MiniTweetText} from '../../../../../renderer/components/mini_tweet/text';
import TweetText from '../../../../../renderer/components/tweet/text';

function doNothing() {
    // Do nothing
}

test('show text for the status', t => {
    const c = shallow(
        <MiniTweetText
            status={fixture.tweet()}
            focused={false}
            onClick={doNothing}
        />
    );
    t.true(c.find(TweetText).length > 0);

    const rt = fixture.retweet();
    const c2 = shallow(
        <MiniTweetText
            status={rt}
            focused={false}
            onClick={doNothing}
        />
    );
    t.is(c2.find(TweetText).props().status.id, rt.retweeted_status.id);
});

test('can be focused', t => {
    const c = shallow(
        <MiniTweetText
            status={fixture.quote()}
            focused
            onClick={doNothing}
        />
    );
    t.true(c.find('.mini-tweet__quote_focused').length > 0);
});

test('show quote with icon', t => {
    const qt = fixture.quote();
    const c = shallow(
        <MiniTweetText
            status={qt}
            focused={false}
            onClick={doNothing}
        />
    );
    t.true(c.find('.fa.fa-quote-left').length > 0);
    const texts = c.find(TweetText);
    t.is(texts.length, 2);
    t.is(texts.at(1).props().status.id, qt.quoted_status.id);
});

test('fire onClick event', t => {
    const cb = spy();
    const c = shallow(
        <MiniTweetText
            status={fixture.quote_media()}
            focused={false}
            onClick={cb}
        />
    );
    const pic = c.find('.mini-tweet__has-pic');
    t.true(pic.length > 0);
    pic.simulate('click', {
        stopPropagation() { /* do nothing */ }
    });
    t.true(cb.called);
});


