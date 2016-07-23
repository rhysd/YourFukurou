import * as React from 'react';
import {connect} from 'react-redux';
import State from '../states/root';
import SideMenu from './side_menu';
import Timeline from './timeline';
import TweetEditor from './editor/index';
import SlaveTimeline from './slave_timeline/index';

interface AppProps extends React.Props<any> {
    readonly editorOpen: boolean;
    readonly slaveOpen: boolean;
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu/>
        <div className="app-root__main">
            {props.editorOpen ? <TweetEditor/> : undefined}
            <div className="app-root__timeline">
                <Timeline/>
                {props.slaveOpen ? <SlaveTimeline/> : undefined}
            </div>
        </div>
    </div>
);

function select(state: State): AppProps {
    return {
        editorOpen: state.editor.is_open,
        slaveOpen: state.slaveTimeline !== null,
    };
}

export default connect(select)(App);
