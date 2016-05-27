import test from 'ava';
import YourFukurou from '../helper/yourfukurou';
import Timeline from '../page/timeline';

test.beforeEach(async (t) => {
    t.context.yf = new YourFukurou();
    return await t.context.yf.start();
});

test.afterEach.always(async (t) => {
    if (t.context.yf && t.context.yf.isRunning()) {
        await t.context.yf.captureScreenShot('screenshot_initial_timeline.png');
        await t.context.yf.stop();
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
    await tl.clickFirstTweet();
    await tl.ensureFocusedItem();
    await tl.clickFirstTweet();
    await tl.ensureNoFocusedItem();

    const tweets = await tl.allTweets();
    for (const id of tweets.map(e => e.ELEMENT)) {
        await tl.clickTweet(id);
        await tl.ensureFocusedItem();
        await client.pause(100);
    }
});
