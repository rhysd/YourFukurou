import * as React from 'react';
import {connect} from 'react-redux';
import State from '../states/root';
import SideMenu from './side_menu';
import Timeline from './timeline';
import TweetEditor from './editor/index';
import SlaveTimeline from './slave_timeline/index';
import Message from './message';
import {MessageState} from '../reducers/message';
import {Dispatch} from '../store';

interface AppProps extends React.Props<any> {
    readonly editorOpen: boolean;
    readonly slaveOpen: boolean;
    readonly message: MessageState;
    readonly dispatch?: Dispatch;
}

export const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu/>
        <div className="app-root__main">
            {props.editorOpen ? <TweetEditor/> : undefined}
            {props.message === null ?
                undefined :
                <Message
                    text={props.message.text}
                    kind={props.message.kind}
                    dispatch={props.dispatch!}
                />}
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
        message: state.message,
    };
}

export default connect(select)(App);
