// Need for Electron's browserify workaround
global.require = require;

import * as React from 'react';
import {Provider} from 'react-redux';
import Fixture from '../fixture/fixture';
import Store from '../../../renderer/store';

export const fixture = new Fixture();

export function provide(child: JSX.Element | JSX.Element[]) {
    return <Provider store={Store}>
        {child}
    </Provider>;
}
