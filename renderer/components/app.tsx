import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {State} from '../reducers';
import SideMenu from './side_menu';
import Timeline from './timeline';
import Item from '../item/item';

interface AppProps {
    items: List<Item>;
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu/>
        <Timeline items={props.items}/>
    </div>
);

function select(state: State): AppProps {
    return {
        items: state.current_items
    };
}

export default connect(select)(App);
