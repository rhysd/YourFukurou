import test from 'ava';
import YourFukurou from '../helper/yourfukurou';
import Timeline from '../page/timeline';

test.beforeEach(async (t) => {
    t.context.yf = new YourFukurou();
    return await t.context.yf.start();
});

test.afterEach.always(async (t) => {
    const yf = t.context.yf;
    if (yf && yf.isRunning()) {
        await yf.dumpLogsTo('actions_log.json');
        await yf.captureScreenShot('actions');
        await yf.stop();
    }
});

test(async (t) => {
    const client = t.context.yf.client;

    const tl = new Timeline(client);
    await tl.waitForTweet();

    const tw = await tl.firstTweet();
    t.false(tw === null);

    await tw.click();

    await tw.like();
    await tw.like();

    await tw.retweet();

    const tw2 = await tl.secondTweet();
    await tw2.retweet();

    const tw1 = await tl.firstTweet();
    await tw1.click();
    const editor = await tw1.reply();
    await client.pause(2000);
    t.true(await editor.sendButtonIsActive());
});

