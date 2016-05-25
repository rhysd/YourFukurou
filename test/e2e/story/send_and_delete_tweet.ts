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

    const menu = new SideMenu(client);
    t.is((await menu.activeButtons()).length, 1);

    const editor = await menu.openEditor();
    await client.pause(2000);
    t.is((await menu.activeButtons()).length, 2);

    t.true(await editor.sendButtonIsInactive());
    await editor.inputKeys('This is a test');
    t.true(await editor.sendButtonIsActive());
    await client.pause(2000);

    // TODO: Should send tweet
    const timeline = await editor.cancelTweet();

    const tw = await timeline.findTweetByText('i');
    t.not(tw, null);
});
