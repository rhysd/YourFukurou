import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {State} from '../reducers';
import SideMenu from './side_menu';
import Timeline from './timeline';

interface AppProps {
    tweets: List<TweetStatus>;
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu/>
        <Timeline tweets={props.tweets}/>
    </div>
);

function select(state: State): AppProps {
    return {
        tweets: state.current_tweets
    };
}

export default connect(select)(App);
