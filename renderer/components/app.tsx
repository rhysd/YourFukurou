import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {EditorState} from 'draft-js';
import {State} from '../reducers';
import SideMenu from './side_menu';
import Timeline from './timeline';
import TweetEditor from './tweet/editor';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import EditorKeybinds from '../keybinds/editor';

interface AppProps {
    items: List<Item>;
    message: MessageInfo;
    user: TwitterUser;
    editor: EditorState;
    editorOpen: boolean;
    editorKeybinds: EditorKeybinds;
    inReplyTo: Tweet;
}

function renderEditor(props: AppProps) {
    if (props.editorOpen) {
        return <TweetEditor
            editor={props.editor}
            keybinds={props.editorKeybinds}
            inReplyTo={props.inReplyTo}
        />;
    } else {
        return undefined;
    }
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu user={props.user}/>
        <div className="app-root__main">
            {renderEditor(props)}
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
        inReplyTo: state.editor_in_reply_to_status,
    };
}

export default connect(select)(App);
