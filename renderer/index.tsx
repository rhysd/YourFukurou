import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import Store from './store';
import App from './components/app';

render(
    <Provider store={Store}>
        <App/>
    </Provider>,
    document.getElementById('yourfukurou')
);
