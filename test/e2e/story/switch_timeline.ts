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
        await yf.dumpLogsTo('switch_timeline_log.json');
        await yf.captureScreenShot('switch_timeline');
        await yf.stop();
    }
});

test(async (t) => {
    const client = t.context.yf.client;

    const menu = new SideMenu(client);
    await menu.homeButtonIsActive();
    await menu.mentionButtonIsInactive();
    await client.pause(1000);

    await menu.switchToMention();
    await menu.homeButtonIsInactive();
    await menu.mentionButtonIsActive();
    await client.pause(1000);

    await menu.switchToHome();
    await menu.homeButtonIsActive();
    await menu.mentionButtonIsInactive();
});


