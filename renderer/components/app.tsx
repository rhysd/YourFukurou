import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../reducers';
import SideMenu from './side_menu';

interface Props {
}

const App = (props: Props) => (
    <div className="app-root">
        <SideMenu/>
        <div style={{flex: 'auto', height: '100%'}}>
            Reserved Space!
        </div>
    </div>
);

function select(state: State): Props {
    return state;
}

export default connect(select)(App);
