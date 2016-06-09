import test from 'ava';
import YourFukurou from '../helper/yourfukurou';
import SideMenu from '../page/side_menu';

const SLOW_DOWN = 2000;

test.beforeEach(async (t) => {
    t.context.yf = new YourFukurou();
    return await t.context.yf.start();
});

test.afterEach.always(async (t) => {
    const yf = t.context.yf;
    if (yf && yf.isRunning()) {
        await yf.dumpLogsTo('modern_webapp_lt_demo_log.json');
        await yf.captureScreenShot('screenshot_modern_webapp_lt_demo.png');
        await yf.stop();
    }
});

test(async (t) => {
    const client = t.context.yf.client;
    await client.pause(3000);

    const editor = await new SideMenu(client).openEditor();
    await client.pause(SLOW_DOWN);

    const text = 'This tweet is demo for Modern Webapp LT.';
    t.true(await editor.sendButtonIsInactive());
    await editor.inputKeys(text);
    t.true(await editor.sendButtonIsActive());
    await client.pause(SLOW_DOWN);

    const message = await editor.sendTweet();
    await message.ensureInfoMessage();
    const timeline = await message.waitForMessageDismissed();

    // Wait for receiving sent tweet via user stream
    await client.pause(SLOW_DOWN);

    const tw = await timeline.firstTweet();
    await tw.click(); // Focus to show action buttons
    await tw.delete();
    await client.pause(SLOW_DOWN);

    const tw2 = await timeline.firstTweet();
    await tw2.click();
    await client.pause(100);
    await tw2.click();
    await client.pause(100);
    await tw2.like();
    await client.pause(SLOW_DOWN);
    await tw2.like();
    await client.pause(SLOW_DOWN);

    await tw.retweet();
    await client.pause(SLOW_DOWN);

    const tw3 = await timeline.secondTweet();
    await tw3.retweet();
    await client.pause(SLOW_DOWN);
});
