import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {State} from '../reducers';
import SideMenu from './side_menu';
import Timeline from './timeline';
import Item from '../item/item';
import {TwitterUser} from '../item/tweet';

interface AppProps {
    items: List<Item>;
    message: MessageInfo;
    user: TwitterUser;
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu user={props.user}/>
        <Timeline {...props}/>
    </div>
);

function select(state: State): AppProps {
    return {
        items: state.current_items,
        message: state.current_message,
        user: state.current_user,
    };
}

export default connect(select)(App);
