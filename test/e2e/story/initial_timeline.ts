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
        await yf.dumpLogsTo('initial_timeline_log.json');
        await yf.captureScreenShot('initial_timeline');
        await yf.stop();
    }
});

test(async (t) => {
    const win = t.context.yf.browserWindow;
    const client = t.context.yf.client;

    // Ensure to open browser window
    t.true(await win.isVisible());
    const {width, height} = await win.getBounds();
    t.true(width > 0);
    t.true(height > 0);

    const tl = new Timeline(client);
    await tl.ensureRootNode();

    // Wait for timeline items via IPC
    await client.pause(5000);

    // Toggle tweet item
    await tl.ensureNoFocusedItem();
    await (await tl.firstTweet()).click();
    await tl.ensureFocusedItem();
    await (await tl.firstTweet()).click();
    await tl.ensureNoFocusedItem();

    for (const tw of await tl.allTweets()) {
        await tw.click();
        await tl.ensureFocusedItem();
        await client.pause(100);
    }
});
