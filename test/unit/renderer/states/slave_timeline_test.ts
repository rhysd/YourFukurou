import {fixture} from '../../helper';
import test from 'ava';
import {List} from 'immutable';
import {UserTimeline} from '../../../../renderer/states/slave_timeline';
import Tweet, {TwitterUser} from '../../../../renderer/item/tweet';
import Item from '../../../../renderer/item/item';
import Separator from '../../../../renderer/item/separator';

function makeUserTimeline(u: TwitterUser = fixture.user(), items: Item[] = [], focus: number = null) {
    return new UserTimeline(u, List<Item>(items), focus);
}

test('UserTimeline.getFocusdItem() returns focused item', t => {
    const tw1 = fixture.tweet();
    const tw2 = fixture.retweeted();
    const tw3 = fixture.in_reply_to();
    const u = fixture.user();
    t.is(makeUserTimeline(u, [tw1, tw2, tw3], null).getFocusedItem(), null);
    t.is(
        (makeUserTimeline(u, [tw1, tw2, tw3], 0).getFocusedItem() as Tweet).id,
        tw1.id,
    );
    t.is(
        (makeUserTimeline(u, [tw1, tw2, tw3], 2).getFocusedItem() as Tweet).id,
        tw3.id,
    );
});

test('UserTimeline.addTweets() adds statuses to head of current timeline', t => {
    const tw1 = fixture.tweet();
    const tw2 = fixture.retweeted();
    const tw3 = fixture.in_reply_to();

    const t1 = makeUserTimeline(fixture.user(), [tw1]).addTweets([tw2, tw3]);
    t.is((t1.items.get(0) as Tweet).id, tw2.id);
    t.is((t1.items.get(1) as Tweet).id, tw3.id);
    t.is((t1.items.get(2) as Tweet).id, tw1.id);
    t.is(t1.focus_index, null);

    const t2 = makeUserTimeline(fixture.user(), [tw1], 0).addTweets([tw2, tw3]);
    t.is(t2.focus_index, 2);
});

test('UserTimeline.appendPastItems() adds statuses to bottom of current timeline', t => {
    const tw1 = fixture.tweet();
    const tw2 = fixture.retweeted();
    const tw3 = fixture.in_reply_to();

    const t1 = makeUserTimeline(fixture.user(), [tw1, new Separator()]).appendPastItems([tw2, tw3]);
    t.is((t1.items.get(0) as Tweet).id, tw1.id);
    t.is((t1.items.get(1) as Tweet).id, tw2.id);
    t.is((t1.items.get(2) as Tweet).id, tw3.id);
    t.is(t1.focus_index, null);

    const t2 = makeUserTimeline(fixture.user(), [tw1, new Separator()], 1).appendPastItems([tw2, tw3]);
    t.is(t2.focus_index, 1);
});

test('UserTimeline.blur() loses its focus', t => {
    const t1 = makeUserTimeline(fixture.user(), [new Separator()], 0);
    t.is(t1.blur().focus_index, null);
    const t2 = makeUserTimeline(fixture.user(), [new Separator()]);
    t.is(t2.blur().focus_index, null);
});

