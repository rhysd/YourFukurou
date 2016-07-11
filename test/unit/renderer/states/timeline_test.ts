import {fixture} from '../../helper';
import test from 'ava';
import {List} from 'immutable';
import TimelineState, {DefaultTimelineState, TimelineKind} from '../../../../renderer/states/timeline';
import Tweet from '../../../../renderer/item/tweet';
import Item from '../../../../renderer/item/item';
import Config from '../../../../renderer/config';
import PM from '../../../../renderer/plugin_manager';

const DefaultMuteConfig = Config.mute;

const TWEETS = [
    fixture.tweet(),
    fixture.retweet(),
    fixture.media(),
    fixture.retweet_media(),
    fixture.quote(),
    fixture.quote_media(),
    fixture.in_reply_to(),
];

// Generates a [0, n) integer
function randN(n: number) {
    return Math.floor(Math.random() * n);
}

function getRandomTweet() {
    return TWEETS[randN(TWEETS.length)];
}

function getRandomTweets() {
    const len = randN(100);
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
        user: fixture.user(),
        home: List<Item>(home),
        mention: List<Item>(mention),
    });
}

function setMuteConfig(c: {home?: boolean, mention?: boolean}) {
    const mute = {home: !!c.home, mention: !!c.mention};
    /* tslint:disable */
    Config['remote_config_memo'].mute = mute;
    Config['mute_memo'] = mute;
    /* tslint:enable */
}

type FilterFunc = (tw: Tweet, s: TimelineState) => boolean;
function setPluginFilters(home_timeline?: FilterFunc, mention_timeline?: FilterFunc) {
    PM.addPluginDirectly({
        filter: {
            home_timeline,
            mention_timeline,
        },
    });
}

test.afterEach(() => {
    setMuteConfig(DefaultMuteConfig);
    PM.reset();
});

test('getCurrentTimeline() selects current displayed timeline', t => {
    const tw = fixture.tweet();
    const rp = fixture.in_reply_to();

    const s = getState(
        [tw, tw, tw],
        'home',
        [rp, rp]
    );
    t.is(s.getCurrentTimeline().size, 3);
    t.is((s.getCurrentTimeline().get(0) as Tweet).id, tw.id);

    const s2 = getState(
        [tw, tw, tw],
        'mention',
        [rp, rp]
    );
    t.is(s2.getCurrentTimeline().size, 2);
    t.is((s2.getCurrentTimeline().get(0) as Tweet).id, rp.id);
});

test('switchTimeline() changes current timeline kind', t => {
    const tw = fixture.tweet();
    const rp = fixture.in_reply_to();

    const s = getState(
        [tw, tw, tw],
        'home',
        [rp, rp]
    );

    t.is(s.kind, 'home');
    t.is(s.switchTimeline('mention').kind, 'mention');
    t.is(s.switchTimeline('home').kind, 'home');
    t.is(s.switchTimeline('mention').switchTimeline('home').kind, 'home');
    t.is(s.switchTimeline('mention').switchTimeline('mention').kind, 'mention');
});

test('shouldAddToTimeline() should reject muted or blocked tweets', t => {
    const tw = fixture.tweet_other();
    const rp = fixture.in_reply_to_from_other();
    const s = getState();

    // Post condition
    t.true(tw.user.id !== s.user.id);
    t.true(rp.user.id !== s.user.id);

    s.rejected_ids = List<number>([tw.user.id, rp.user.id]);

    {
        const should_add_to = s.shouldAddToTimeline(tw);
        t.false(should_add_to.home);
        t.false(should_add_to.mention);
    }

    {
        const should_add_to = s.shouldAddToTimeline(rp);
        t.false(should_add_to.home);
        t.true(should_add_to.mention);
    }
});

test('shouldAddToTimeline() only adds mentions to mention timeline', t => {
    const s = getState();

    const non_mentions = [
        fixture.tweet(),
        fixture.tweet_other(),
        fixture.quote(),
        fixture.retweet_media(),
    ];
    for (const tw of non_mentions) {
        const should_add_to = s.shouldAddToTimeline(tw);
        t.true(should_add_to.home);
        t.false(should_add_to.mention);
    }

    const mentions = [
        fixture.in_reply_to_from_other(),
    ];
    for (const tw of mentions) {
        const should_add_to = s.shouldAddToTimeline(tw);
        t.true(should_add_to.home);
        t.true(should_add_to.mention);
    }

    // Edge case: Self mention
    {
        const should_add_to = s.shouldAddToTimeline(fixture.reply_myself());
        t.true(should_add_to.home);
        t.false(should_add_to.mention);
    }
});

test('shouldAddToTimeline() should reject RT also', t => {
    const rt = fixture.retweet_other();
    const s = getState();

    // Note: by both retweeted status and retweet itself
    const each_ids = [rt.user.id, rt.retweeted_status.user.id];

    for (const id of each_ids) {
        s.rejected_ids = List<number>([id]);
        const should_add_to = s.shouldAddToTimeline(rt);
        t.false(should_add_to.home);
        t.false(should_add_to.mention);
    }
});

test('shouldAddToTimeline() considers mute config', t => {
    const tw = fixture.in_reply_to_from_other();
    const s = getState();
    s.rejected_ids = List<number>([tw.user.id]);

    const configs = [
        {home: true, mention: true},
        {home: true, mention: false},
        {home: false, mention: true},
        {home: false, mention: false},
    ];

    for (const c of configs) {
        setMuteConfig(c);
        const should_add_to = s.shouldAddToTimeline(tw);
        t.is(should_add_to.home, !c.home);
        t.is(should_add_to.mention, !c.mention);
    }
});

test('shouldAddToTimeline() considers plugin', t => {
    const tw = fixture.tweet_other();
    const rp = fixture.in_reply_to_from_other();
    const s = getState();

    // Note:
    // Plugin's filtering has higher priority than user's configuration.
    setMuteConfig({home: false, mention: false});

    setPluginFilters(
        (tweet: Tweet) => tw.id !== tweet.id,
        (tweet: Tweet) => rp.id !== tweet.id
    );

    const should_add_tweet_to = s.shouldAddToTimeline(tw);
    t.false(should_add_tweet_to.home);

    const should_add_other_tweet_to = s.shouldAddToTimeline(fixture.tweet());
    t.true(should_add_other_tweet_to.home);

    const should_add_reply_to = s.shouldAddToTimeline(rp);
    t.true(should_add_reply_to.home);
    t.false(should_add_reply_to.mention);
});

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
        const prev = s;
        const r = randN(6);
        switch (r) {
        case 0:
            s = s.focusOn(randN(s.getCurrentTimeline().size));
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
        if (randN(20) === 0) {
            s = s.switchTimeline(s.kind === 'home' ? 'mention' : 'home');
        }
        t.true(
            s.focus_index !== undefined,
            `before: ${prev.focus_index}, after: ${s.focus_index}, r: ${r}`
        );
    }
});

test('addNewTweet() adds tweet to timelines', t => {
    const tw = fixture.tweet();
    const s = getState();
    const s1 = s.addNewTweet(tw).addNewTweet(tw).addNewTweet(tw);
    t.is(s1.home.size, 3);
    t.is((s1.home.get(0) as Tweet).id, tw.id);
    t.is(s1.mention.size, 0);

    const rp = fixture.in_reply_to_from_other();
    const s2 = s.addNewTweet(rp).addNewTweet(tw).addNewTweet(rp);
    t.is(s2.home.size, 3);
    t.is(s2.mention.size, 2);
    t.is((s2.mention.get(0) as Tweet).id, rp.id);
});

test('addNewTweet() updates retweets in home timeline', t => {
    const tw = fixture.tweet();
    const rt = fixture.retweet();
    const s = getState([tw, rt, tw]);
    const s1 = s.addNewTweet(rt);
    t.is(s1.home.size, 3);
    t.is((s1.home.first() as Tweet).id, rt.id);
});

test('addNewTweet() moves focus on adding tweet to home timeline', t => {
    const tw = fixture.tweet();

    for (let i = 0; i < 3; ++i) {
        let s = getState([tw, tw, tw]);
        s = s.focusOn(i);
        s = s.addNewTweet(tw);
        t.is(s.focus_index, i + 1);
    }
});

test('addNewTweet() handle focus on retweet is updated', t => {
    const tw = fixture.tweet();
    const rt = fixture.retweet();
    const s = getState([tw, rt, tw]);
    t.is(s.focusOn(2).addNewTweet(rt).focus_index, 2);
    t.is(s.focusOn(1).addNewTweet(rt).focus_index, 1);
    t.is(s.focusOn(0).addNewTweet(rt).focus_index, 1); // Edge case
});

// TODO: Add tests for updating state.notified on addNewTweet()
// TODO: Add tests for updating mention timeline on addNewTweet()

