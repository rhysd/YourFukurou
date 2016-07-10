import {fixture} from '../../helper';
import test from 'ava';
import {List} from 'immutable';
import TimelineState, {DefaultTimelineState, TimelineKind} from '../../../../renderer/states/timeline';
import Tweet from '../../../../renderer/item/tweet';
import Item from '../../../../renderer/item/item';

const TWEETS = [
    fixture.tweet(),
    fixture.retweet(),
    fixture.media(),
    fixture.retweet_media(),
    fixture.quote(),
    fixture.quote_media(),
    fixture.in_reply_to(),
];

function getRandomTweet() {
    return TWEETS[Math.floor(Math.random() * TWEETS.length)];
}

function getRandomTweets() {
    const len = Math.floor(Math.random() * 100);
    let tweets = [] as Item[];
    for (let i = 0; i < len; ++i) {
        tweets.push(getRandomTweet());
    }
    return tweets;
}

function getRandomMentions() {
    return Array(Math.random() * 100).fill(fixture.in_reply_to());
}

function getState(
    home: Item[] = [],
    kind: TimelineKind = 'home',
    mention: Item[] = []
) {
    return DefaultTimelineState.update({
        kind,
        home: List<Item>(home),
        mention: List<Item>(mention),
    });
}

test('focusOn() focuses on an item', t => {
    const s = getState([fixture.tweet(), fixture.tweet(), fixture.tweet()]);
    t.is(s.focus_index, null);
    t.is(s.focusOn(0).focus_index, 0);
    t.is(s.focusOn(1).focus_index, 1);
    t.is(s.focusOn(-1).focus_index, null);
    t.is(s.focusOn(3).focus_index, null);
});

test('focusNext() and focusPrevious() moves focus relatively', t => {
    const s = getState([fixture.tweet(), fixture.tweet(), fixture.tweet()]);
    t.is(s.focusNext().focus_index, 0);
    t.is(s.focusNext().focusNext().focus_index, 1);
    t.is(s.focusNext().focusNext().focusPrevious().focus_index, 0);
    t.is(s.focusPrevious().focus_index, null);
    t.is(s.focusNext().focusPrevious().focus_index, 0);
    t.is(s.focusNext().focusNext().focusNext().focusNext().focus_index, 2);
});

test('focusTop() and focusBottom() moves focus to edges of timeline', t => {
    const s = getState([fixture.tweet(), fixture.tweet(), fixture.tweet()]);
    t.is(s.focusTop().focus_index, 0);
    t.is(s.focusBottom().focus_index, 2);
    t.is(s.focusNext().focusTop().focus_index, 0);
    t.is(s.focusNext().focusBottom().focus_index, 2);
});

test('moveing focus randomly doesnot raise an error', t => {
    let s = getState(getRandomTweets(), 'home', getRandomTweets());
    for (let i = 0; i < 5000; ++i) {
        const r = Math.floor(Math.random() * 6);
        switch (r) {
        case 0:
            s = s.focusOn(Math.floor(Math.random() * s.getCurrentTimeline().size));
            break;
        case 1:
            s = s.focusNext();
            break;
        case 2:
            s = s.focusPrevious();
            break;
        case 3:
            s = s.focusTop();
            break;
        case 4:
            s = s.focusBottom();
            break;
        case 5:
            s = s.focusOn(null);
            break;
        default:
            break;
        }
        if (Math.floor(Math.random() * 10) === 0) {
            s = s.switchTimeline(s.kind === 'home' ? 'mention' : 'home');
        }
        t.true(s.focus_index !== undefined);
    }
});

