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
    t.ok(await yf.client.waitForExist('#yourfukurou', 5000));
});

