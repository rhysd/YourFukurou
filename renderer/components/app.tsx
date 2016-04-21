import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {EditorState} from 'draft-js';
import {State} from '../reducers';
import SideMenu from './side_menu';
import Timeline from './timeline';
import TweetForm from './tweet/form';
import Item from '../item/item';
import {TwitterUser} from '../item/tweet';
import EditorKeybinds from '../keybinds/editor';

interface AppProps {
    items: List<Item>;
    message: MessageInfo;
    user: TwitterUser;
    editor: EditorState;
    editorOpen: boolean;
    editorKeybinds: EditorKeybinds;
}

function renderForm(props: AppProps) {
    if (props.editorOpen) {
        return <TweetForm
            editor={props.editor}
            keybinds={props.editorKeybinds}
        />;
    } else {
        return undefined;
    }
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu user={props.user}/>
        <div className="app-root__main">
            {renderForm(props)}
            <Timeline items={props.items} message={props.message}/>
        </div>
    </div>
);

function select(state: State): AppProps {
    return {
        items: state.current_items,
        message: state.current_message,
        user: state.current_user,
        editor: state.editor,
        editorOpen: state.editor_open,
        editorKeybinds: state.editor_keybinds,
    };
}

export default connect(select)(App);
