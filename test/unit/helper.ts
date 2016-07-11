// Need for Electron's browserify workaround
global.require = require;

import Fixture from './fixture/fixture';

export const fixture = new Fixture();

(global as any).window = {
    innerWidth: 1000,
    devicePixelRatio: 1.0,
    addEventListener(event: string, listener: Function) { /* do nothing */ },
    removeEventListener(event: string, listener: Function) { /* do nothing */ },
};

window.requestIdleCallback = (cb: Function) => cb();
