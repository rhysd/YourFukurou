'use dog';

import * as path from 'path';
import {Stats} from 'fs';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {whyDidYouUpdate} from 'why-did-you-update';
import * as timing from 'timing.js';
import * as ReactPerf from 'react-addons-perf';
import {Twitter} from 'twit';
import Store from './store';
import IpcChannelProxy from './ipc_channel_proxy';
import App from './components/app';
import {setCurrentUser} from './actions';
import DB from './database/db';
import PM from './plugin_manager';
import KeymapTransition from './keybinds/keymap_transition';
import Tweet from './item/tweet';
import Item from './item/item';
import log from './log';

const fs = global.require('fs');
const electron = global.require('electron');
const app = electron.remote.app;
const remote = electron.remote;
const env = global.process.env;

if (env.YOURFUKUROU_WHY_DID_YOU_UPDATE) {
    whyDidYouUpdate(React);
}

if (env.YOURFUKUROU_PERF) {
    ReactPerf.start();
    setTimeout(() => {
        ReactPerf.stop();
        setTimeout(() => {
            console.log("PERF: Wasted: Time spent on components that didn't actually render anything");
            ReactPerf.printWasted();

            console.log('PERF: Inclusive: Overall time taken');
            ReactPerf.printInclusive();

            console.log('PERF: Exclusive: Overall time exclusive for times taken to mount the components');
            ReactPerf.printExclusive();

            console.log('PERF: Operations: Time for DOM Operation');
            ReactPerf.printOperations();
        }, 1000);
        remote.getCurrentWebContents().openDevTools({mode: 'detach'});
    }, 3000);
}

render(
    <Provider store={Store}>
        <App/>
    </Provider>,
    document.getElementById('yourfukurou')
);

/*
/* App initialization
 */

DB.my_accounts
    .getFirstAccountId()
    .then(id => DB.accounts.getUserById(id))
    .then(u => Store.dispatch(setCurrentUser(u)))
    .catch(() => log.debug('No cache for account was found, skipped.'));

const proxy = new IpcChannelProxy().start();

const user_css_path = path.join(app.getPath('userData'), 'user.css');
fs.lstat(user_css_path, (err: NodeJS.ErrnoException, stats: Stats) => {
    if (err) {
        // Note: user.css is not found
        log.debug('Cannot load user.css:', err.message);
        return;
    }
    if (stats.isFile()) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = user_css_path;
        document.head.appendChild(link);
        log.debug('<link> for loading user.css was inserted');
    }
});

PM.loadPlugins();

// Note: Debug purpose
global.DB = DB;
global.PM = PM;

// Note:
// Debug function to correct statuses JSON for reproducing timeline
if (env.NODE_ENV === 'development') {
    global.emitHomeStatusesJson = () => {
        const tweets = Store.getState().timeline.home
                    .map((i: Item) => i instanceof Tweet ? i.json : null)
                    .filter((s: Twitter.Status) => s !== null)
                    .toArray();
        const json = JSON.stringify({'statuses/home_timeline': tweets}, null, 2);
        fs.writeFile('dummy_rest_responses.json', json);
    };
}

// Note: Post process of application
window.onunload = () => {
    proxy.terminate();
    KeymapTransition.disableAll();
};

window.onload = () => {
    if (env.NODE_ENV === 'development' || env.YOURFUKUROU_PERF) {
        setTimeout(() => timing.printSimpleTable(), 0);
    }
};
