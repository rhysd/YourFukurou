import test from 'ava';
import YourFukurou from '../helper/yourfukurou';
import SideMenu from '../page/side_menu';

test.beforeEach(async (t) => {
    t.context.yf = new YourFukurou();
    return await t.context.yf.start();
});

test.afterEach.always(async (t) => {
    const yf = t.context.yf;
    if (yf && yf.isRunning()) {
        await yf.dumpLogsTo('send_and_delete_tweet_log.json');
        await yf.captureScreenShot('screenshot_send_and_delete_tweet.png');
        await yf.stop();
    }
});

test(async (t) => {
    const client = t.context.yf.client;

    // Open a tweet editor from menu
    const menu = new SideMenu(client);
    t.is((await menu.activeButtons()).length, 1);

    const editor = await menu.openEditor();
    await client.pause(2000);
    t.is((await menu.activeButtons()).length, 2);

    // Input text and check 'send tweet' button state
    const text = "Test.  If this tweet won't be removed, it means test failed";
    t.true(await editor.sendButtonIsInactive());
    await editor.inputKeys(text);
    t.true(await editor.sendButtonIsActive());
    await client.pause(2000);

    // Send tweet and show success message in message
    const message = await editor.sendTweet();
    await message.ensureInfoMessage();
    const timeline = await message.waitForMessageDismissed();

    // Find sent tweet
    const tw = await timeline.findTweetByText(text);
    t.not(tw, null);

    // Delete it
    await timeline.deleteTweet(tw);
    await client.waitForExist('span=' + text, 100, true);
});
