import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import Store from './store';
import IpcChannelProxy from './ipc_channel_proxy';
import App from './components/app';

console.log(global.process.env.NODE_ENV);

render(
    <Provider store={Store}>
        <App/>
    </Provider>,
    document.getElementById('yourfukurou')
);

const proxy = new IpcChannelProxy().start();
window.onunload = () => proxy.terminate();
