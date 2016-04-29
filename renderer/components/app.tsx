import * as React from 'react';
import {connect} from 'react-redux';
import State from '../states/root';
import SideMenu from './side_menu';
import Timeline from './timeline';
import TweetEditor from './editor/index';

interface AppProps {
    editorOpen: boolean;
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu/>
        <div className="app-root__main">
            {props.editorOpen ? <TweetEditor/> : undefined}
            <Timeline/>
        </div>
    </div>
);

function select(state: State): AppProps {
    'use strict';
    return {
        editorOpen: state.editor.is_open,
    };
}

export default connect(select)(App);
