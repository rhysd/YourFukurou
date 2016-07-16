import {fixture} from '../../helper';
import test from 'ava';
import {List} from 'immutable';
import TimelineState, {DefaultTimelineState, TimelineKind} from '../../../../renderer/states/timeline';
import Item from '../../../../renderer/item/item';
import Tweet from '../../../../renderer/item/tweet';
import Activity from '../../../../renderer/item/timeline_activity';
import Separator from '../../../../renderer/item/separator';
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

function getState(
    home: Item[] = [],
    kind: TimelineKind = 'home',
    mention: Item[] = [],
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
    (Config['remote_config_memo'] as any).mute = mute;
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

test('getTimeline() returns corresponding timeline', t => {
    const home = List<number>([]);
    const mention = List<number>([]);
    const s = DefaultTimelineState.update({home, mention});
    t.is(s.getTimeline('home'), home);
    t.is(s.getTimeline('mention'), mention);
});

test('getCurrentTimeline() selects current displayed timeline', t => {
    const tw = fixture.tweet();
    const rp = fixture.in_reply_to();

    const s = getState(
        [tw, tw, tw],
        'home',
        [rp, rp],
    );
    t.is(s.getCurrentTimeline().size, 3);
    t.is((s.getCurrentTimeline().get(0) as Tweet).id, tw.id);

    const s2 = getState(
        [tw, tw, tw],
        'mention',
        [rp, rp],
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
        [rp, rp],
    );

    t.is(s.kind, 'home');
    t.is(s.switchTimeline('mention').kind, 'mention');
    t.is(s.switchTimeline('home').kind, 'home');
    t.is(s.switchTimeline('mention').switchTimeline('home').kind, 'home');
    t.is(s.switchTimeline('mention').switchTimeline('mention').kind, 'mention');

    const n = s.addNewTweet(rp).switchTimeline('mention').notified;
    t.false(n.mention);
});

test('shouldAddToTimeline() should reject muted or blocked tweets', t => {
    const tw = fixture.tweet_other();
    const rp = fixture.in_reply_to_from_other();
    const s = getState().update({
        rejected_ids: List<number>([tw.user.id, rp.user.id]),
    });

    // Post condition
    t.true(tw.user.id !== s.user.id);
    t.true(rp.user.id !== s.user.id);

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
        const should_add_to =
            s.update({rejected_ids: List<number>([id])})
                .shouldAddToTimeline(rt);
        t.false(should_add_to.home);
        t.false(should_add_to.mention);
    }
});

test('shouldAddToTimeline() considers mute config', t => {
    const tw = fixture.in_reply_to_from_other();
    const s = getState().update({rejected_ids: List<number>([tw.user.id])});

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
        (tweet: Tweet) => rp.id !== tweet.id,
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
    t.is(getState().focusOn(0).focus_index, null);
});

test('focusNext() and focusPrevious() moves focus relatively', t => {
    const s = getState([fixture.tweet(), fixture.tweet(), fixture.tweet()]);
    t.is(s.focusNext().focus_index, 0);
    t.is(s.focusNext().focusNext().focus_index, 1);
    t.is(s.focusNext().focusNext().focusPrevious().focus_index, 0);
    t.is(s.focusPrevious().focus_index, null);
    t.is(s.focusNext().focusPrevious().focus_index, 0);
    t.is(s.focusNext().focusNext().focusNext().focusNext().focus_index, 2);
    t.is(getState().focusNext().focus_index, null);
    t.is(getState().focusPrevious().focus_index, null);
});

test('focusTop() and focusBottom() moves focus to edges of timeline', t => {
    const s = getState([fixture.tweet(), fixture.tweet(), fixture.tweet()]);
    t.is(s.focusTop().focus_index, 0);
    t.is(s.focusBottom().focus_index, 2);
    t.is(s.focusNext().focusTop().focus_index, 0);
    t.is(s.focusNext().focusBottom().focus_index, 2);
    t.is(getState().focusTop().focus_index, null);
    t.is(getState().focusBottom().focus_index, null);
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
            `before: ${prev.focus_index}, after: ${s.focus_index}, r: ${r}`,
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

    const rt = fixture.retweeted();
    const s3 = s2.addNewTweet(rt);
    t.is(s3.mention.size, 3);
    t.true(s3.mention.first() instanceof Activity);
    t.is((s3.mention.first() as Activity).by[0].id, rt.user.id);

    const rt2 = fixture.retweeted();
    const s4 = s3.addNewTweet(rt2);
    t.is(s3.mention.size, s4.mention.size);
    t.true(s4.mention.first() instanceof Activity);
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

test('addNewTweet() moves focus on adding mentions to mention timeline', t => {
    const rp = fixture.in_reply_to_from_other();

    const state = getState([], 'mention', [rp, rp, rp]);
    for (let i = 0; i < state.mention.size; ++i) {
        const s = state.focusOn(i).addNewTweet(rp);
        t.is(s.focus_index, i + 1);
    }
});

test('addNewTweet() moves focus on adding retweet activity to mention timeline', t => {
    const rt = fixture.retweeted();
    const rp = fixture.in_reply_to_from_other();
    const state = getState([], 'mention', [rp, rp, rp]);

    for (let i = 0; i < 3; ++i) {
        let s = state.focusOn(i).addNewTweet(rt);
        t.is(s.focus_index, i + 1);
        s = s.addNewTweet(rp);
        t.is(s.focus_index, i + 2);
    }

    // TODO: Add tests of multiple users retweets your same tweet.
});

test('addNewTweet() notifies behind timeline updates', t => {
    const tw = fixture.tweet();
    const rt = fixture.retweeted();
    const rp = fixture.in_reply_to_from_other();

    const s1 = getState();
    t.false(s1.notified.home);
    t.false(s1.notified.mention);

    const n1 = s1.addNewTweet(rt).notified;
    t.false(n1.home);
    t.true(n1.mention);

    const n2 = s1.addNewTweet(rp).notified;
    t.false(n2.home);
    t.true(n2.mention);

    const s2 = getState([], 'mention');

    const n3 = s2.addNewTweet(tw).notified;
    t.true(n3.home);
    t.false(n3.mention);

    const n4 = s2.addNewTweet(rt).notified;
    t.true(n4.home);
    t.false(n4.mention);
});

test('addSeparator() adds one separator at once', t => {
    const s1 = getState().addSeparator();
    t.true(s1.home.first() instanceof Separator);
    t.is(s1.home.size, 1);
    t.true(s1.mention.first() instanceof Separator);
    t.is(s1.mention.size, 1);

    const s2 = s1.addSeparator();
    t.is(s2.home.size, 1);
    t.is(s2.mention.size, 1);

    const s3 = s2.addNewTweet(fixture.tweet()).addSeparator();
    t.is(s3.home.size, 3);
    t.is(s3.mention.size, 1);
});

test('addTweets() and addMentions() adds multiple tweets', t => {
    const tw = fixture.tweet();
    const rp = fixture.in_reply_to_from_other();
    const rt = fixture.retweeted();

    const s1 = getState().addNewTweets([tw, rp, tw, rp, tw]);
    t.is(s1.home.size, 5);
    t.is(s1.mention.size, 2);
    t.true(s1.notified.mention);

    const s2 = getState().addMentions([rp, rp, rt]);
    t.is(s2.home.size, 0);
    t.is(s2.mention.size, 3);
    t.true(s2.notified.mention);

    const s3 = getState([], 'mention', [rp]).focusOn(0).addMentions([rt, rp, rt]);
    t.is(s3.focus_index, 2);  // RT does not duplicate

    const s4 = getState([tw], 'home', [rp]).focusOn(0).addMentions([rt, rp, rt]);
    t.is(s4.focus_index, 0);
});

test('deleteStatusWithId() deletes statuses in timelines', t => {
    const tw = fixture.tweet();
    const tw2 = fixture.tweet_other();
    const rp = fixture.in_reply_to_from_other();
    const rt = fixture.retweeted();
    const tw3 = rt.retweeted_status;

    const s = getState([rt.retweeted_status, rp, tw, tw2, rt], 'home', [rp, rt]);

    const s1 = s.deleteStatusWithId(tw.id);
    t.is(s1.home.size, 4);
    t.is(s1.mention.size, 2);
    t.deepEqual(
        s1.home.map(i => (i as Tweet).id).toArray(),
        [tw3.id, rp.id, tw2.id, rt.id],
    );

    const s2 = s.deleteStatusWithId(tw2.id);
    t.is(s2.home.size, 4);
    t.is(s2.mention.size, 2);
    t.deepEqual(
        s2.home.map(i => (i as Tweet).id).toArray(),
        [tw3.id, rp.id, tw.id, rt.id],
    );

    const s3 = s.deleteStatusWithId(rt.retweeted_status.id);
    t.is(s3.home.size, 3);
    t.is(s3.mention.size, 1);
    t.deepEqual(
        s3.home.map(i => (i as Tweet).id).toArray(),
        [rp.id, tw.id, tw2.id],
    );
    t.deepEqual(
        s3.mention.map(i => (i as Tweet).id).toArray(),
        [rp.id],
    );

    const s4 = s.deleteStatusWithId('123456');
    t.deepEqual(
        s4.home.map(i => (i as Tweet).id).toArray(),
        s.home.map(i => (i as Tweet).id).toArray(),
    );
    t.deepEqual(
        s4.mention.map(i => (i as Tweet).id).toArray(),
        s.mention.map(i => (i as Tweet).id).toArray(),
    );
});

test('updateStatus() replaces all status in home timelines', t => {
    const rt = fixture.retweet();
    const tw = rt.retweeted_status;
    const tw2 = fixture.tweet();

    const s = getState([tw, rt, tw2]);
    const s2 = s.updateStatus(tw.clone());
    t.not(s2.home.get(0), tw);
    t.not(s2.home.get(1), rt);
    t.is(s2.home.get(2), tw2);
});

test('updateStatus() replaces all status in mention timelines', t => {
    const rp = fixture.in_reply_to_from_other();
    const rt = fixture.retweeted();
    const s = getState([], 'home', [rt, rp]);

    const s2 = s.updateStatus(rp.clone());
    t.not(s2.mention.get(1), rp);

    const s3 = s.addNewTweet(rt);
    const s4 = s3.updateStatus(rt.retweeted_status.clone());
    t.not(s4.mention.get(0), s3.mention.get(0));
});

test('addRejectedIds() adds ids as "marked or blocked"', t => {
    let s = getState();
    t.is(s.rejected_ids.size, 0);

    s = s.addRejectedIds([1111, 2222]);
    t.is(s.rejected_ids.size, 2);
    t.true(s.rejected_ids.contains(1111));
    t.true(s.rejected_ids.contains(2222));

    // Remove duplicate
    s = s.addRejectedIds([3333, 1111, 4444]);
    t.is(s.rejected_ids.size, 4);
    t.is(s.rejected_ids.count(e => e === 1111), 1);
});

test('addRejectedIds() removes statuses having newly added IDs from timelines', t => {
    const tw = fixture.tweet_other();
    const rt = fixture.retweeted();
    const tw2 = rt.retweeted_status;
    const s = getState([tw, rt, tw2, tw], 'home', [rt]);

    const s1 = s.addRejectedIds([tw.user.id]);
    t.is(s1.home.size, 2);
    t.is((s1.home.get(0) as Tweet).id, rt.id);
    t.is((s1.home.get(1) as Tweet).id, tw2.id);

    const s2 = s.addRejectedIds([rt.user.id]);
    t.is(s2.home.size, 3);

    const s3 = s.addRejectedIds([tw2.user.id]);
    t.is(s3.home.size, 2);
    t.is((s3.home.get(1) as Tweet).id, tw.id);
    t.is(s3.mention.size, 0);
});

test('removeRejectedIds() removes specified IDs from rejected IDs', t => {
    const s1 = DefaultTimelineState.removeRejectedIds([1111, 2222, 3333]);
    t.is(s1.rejected_ids.size, 0);

    const s2 = DefaultTimelineState
        .update({rejected_ids: List<number>([1111, 2222])})
        .removeRejectedIds([2222, 3333]);

    t.deepEqual(s2.rejected_ids.toArray(), [1111]);
});

test('addFriends() add IDs to friend list', t => {
    const s1 = getState().addFriends([1111, 2222, 3333]);
    t.deepEqual(s1.friend_ids.toArray(), [1111, 2222, 3333]);
    t.is(s1.addFriends([]), s1);
    t.is(s1.addFriends([2222]), s1);

    const s2 = s1.addFriends([2222, 4444]);
    t.deepEqual(s2.friend_ids.toArray(), [1111, 2222, 3333, 4444]);
});

test('removeFriends() removes IDs from friend list', t => {
    const s = getState().addFriends([1111, 2222, 3333]);
    t.is(s.removeFriends([]).friend_ids.size, s.friend_ids.size);

    const s1 = s.removeFriends([2222, 3333, 4444]);
    t.deepEqual(s1.friend_ids.toArray(), [1111]);
});

test('resetFriends() replaces friend IDs with specified ones', t => {
    const s = getState().addFriends([1111, 2222, 3333]);
    t.is(s.resetFriends([]).friend_ids.size, 0);

    const s1 = s.resetFriends([4444, 5555, 6666]);
    t.deepEqual(s1.friend_ids.toArray(), [4444, 5555, 6666]);
});

test('addNoRetweetUserIds() adds IDs to no-retweet ID list', t => {
    const s = getState();
    t.is(s.no_retweet_ids.size, 0);
    const s1 = s.addNoRetweetUserIds([1111, 2222, 3333]);
    t.deepEqual(s1.no_retweet_ids.toArray(), [1111, 2222, 3333]);
    const s2 = s1.addNoRetweetUserIds([2222, 3333, 4444]);
    t.deepEqual(s2.no_retweet_ids.toArray(), [1111, 2222, 3333, 4444]);
});

test('addNoRetweetUserIds() removes retweets retweeted by the ID users', t => {
    const rt = fixture.retweeted();
    const tw = fixture.tweet_other();
    const tw2 = fixture.tweet();
    const s1 = getState([tw, rt, tw2]);

    const home = s1.addNoRetweetUserIds([tw.user.id, rt.user.id]).home.toArray();
    t.deepEqual(home.map(i => (i as Tweet).id), [tw.id, tw2.id]);
});

test('updateActivity() adds "liked" status to mention', t => {
    const tw = fixture.tweet();
    const u = fixture.other_user();
    const u2 = fixture.other_user2();

    const s1 = getState().updateActivity('liked', tw, u);
    t.is(s1.mention.size, 1);
    const l = s1.mention.get(0) as Activity;
    t.true(l instanceof Activity);
    t.is(l.kind, 'liked');
    t.is(l.by.length, 1);
    t.is(l.by[0].id, u.id);
    t.is(l.status.id, tw.id);
    t.true(s1.notified.mention);
    t.false(s1.notified.home);

    const s2 = s1.update({notified: {home: false, mention: false}}).updateActivity('liked', tw, u2);
    t.is(s2.mention.size, 1);
    const l2 = s2.mention.get(0) as Activity;
    t.is(l2.by.length, 2);
    t.is(l2.by[0].id, u2.id);
    t.true(s2.notified.mention);
    t.false(s2.notified.home);
});

test('updateActivity() updates activity count of related status in timeline', t => {
    const tw = fixture.tweet();
    const tw2 = fixture.tweet_other();
    const updated = tw.clone();
    const rp = fixture.in_reply_to_from_other();

    const s1 = getState([tw2, tw]).updateActivity('liked', updated, fixture.other_user());
    t.is(s1.home.get(1), updated);
    t.is(s1.home.get(0), tw2);

    const s2 = getState()
            .updateActivity('liked', tw, fixture.other_user())
            .addMentions([rp]);
    t.is(s2.mention.size, 2);
    t.true(s2.mention.get(0) instanceof Tweet);
    t.true(s2.mention.get(1) instanceof Activity);

    // Updated activity will be put on the top of mention
    const s3 = s2.updateActivity('liked', tw, fixture.other_user2());
    t.is(s3.mention.size, 2);
    t.true(s3.mention.get(0) instanceof Activity);
    t.true(s3.mention.get(1) instanceof Tweet);
});

test.only('updateActivity() does not move focus on updating activity in timeline', t => {
    const tw = fixture.tweet();
    const rp = fixture.in_reply_to_from_other();

    const s = getState([], 'mention', [tw])
            .updateActivity('liked', tw, fixture.other_user())
            .addMentions([rp]);

    const s1 = s.focusOn(0).updateActivity('liked', tw, fixture.other_user2());
    // Continue to focus on the tweet as before activity updated
    t.is(s1.focus_index, 1);

    const s2 = s.focusOn(2).updateActivity('liked', tw, fixture.other_user2());
    t.is(s2.focus_index, 2);
});

// TODO: Add tests for replacing separator with missing statuses
