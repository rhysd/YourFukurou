import test from 'ava';
import {createApp} from './helper';

test.beforeEach(async (t) => {
    t.context.yf = createApp();
    return await t.context.yf.start();
});

test.afterEach(async (t) => await t.context.yf.stop());

test(async (t) => {
    const yf = t.context.yf;
    await yf.client.waitUntilWindowLoaded();

    t.true(await yf.browserWindow.isVisible());
    const {width, height} = await yf.browserWindow.getBounds();
    t.true(width > 0);
    t.true(height > 0);

    t.true(await yf.client.waitForExist('#yourfukurou', 5000));
    t.true(await yf.client.waitForExist('.tweet__body.tweet__body_focused', 5000, true));

    await yf.client.pause(5000); // Wait for first timeline loading
    await yf.client.element('.tweet__body').click();
    t.true(await yf.client.waitForExist('.tweet__body.tweet__body_focused', 5000));

    t.is((await yf.client.elements('.side-menu__button.side-menu__button_active')).value.length, 1);
    await yf.client.element('.side-menu__button').click();
    t.is((await yf.client.elements('.side-menu__button.side-menu__button_active')).value.length, 2);

    await yf.client.pause(3000);
    t.true(await yf.client.waitForExist('.tweet-form', 1000));
    t.true(await yf.client.waitForExist('.tweet-form__send-btn.tweet-form__send-btn_inactive', 500));

    await yf.client.keys('This is a tweet from Spectron.');
    await yf.client.element('.tweet-form__send-btn.tweet-form__send-btn_active').click();
    t.true(await yf.client.waitForExist('.message__body.message__body_info', 5000));
    t.true(await yf.client.waitForExist('span=This is a tweet from Spectron.', 5000));
});

