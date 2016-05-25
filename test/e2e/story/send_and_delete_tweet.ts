import test from 'ava';
import {createApp} from '../helper';
import SideMenu from '../page/side_menu';

test.beforeEach(async (t) => {
    t.context.yf = createApp();
    return await t.context.yf.start();
});

test.afterEach(async (t) => await t.context.yf.stop());

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

    const tw = await timeline.findTweetByText(text);
    t.not(tw, null);
});
