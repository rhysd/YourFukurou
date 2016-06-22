// Need for Electron's browserify workaround
global.require = require;

import Fixture from './fixture/fixture';

export const fixture = new Fixture();

(global as any).window = {
    innerWidth: 1000,
    devicePixelRatio: 1.0,
};
