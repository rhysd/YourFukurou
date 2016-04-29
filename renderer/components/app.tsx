import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {EditorState} from 'draft-js';
import {State} from '../reducers';
import SideMenu from './side_menu';
import Timeline from './timeline';
import TweetEditor from './editor/index';
import Item from '../item/item';
import Tweet, {TwitterUser} from '../item/tweet';
import EditorKeybinds from '../keybinds/editor';
import {AutoCompleteLabel} from './editor/auto_complete_decorator';
import {SuggestionItem} from './editor/suggestions';
import TimelineKind from '../timeline';

interface AppProps {
    items: List<Item>;
    message: MessageInfo;
    user: TwitterUser;
    timeline: TimelineKind;
    editor: EditorState;
    editorOpen: boolean;
    editorKeybinds: EditorKeybinds;
    editorCompletionLabel: AutoCompleteLabel;
    editorCompletionQuery: string;
    editorCompletionLeft: number;
    editorCompletionTop: number;
    editorCompletionSuggestions: SuggestionItem[];
    editorCompletionFocusIdx: number;
    inReplyTo: Tweet;
}

function renderEditor(props: AppProps) {
    if (!props.editorOpen) {
        return undefined;
    }

    return <TweetEditor
        editor={props.editor}
        keybinds={props.editorKeybinds}
        inReplyTo={props.inReplyTo}
        completionLabel={props.editorCompletionLabel}
        completionQuery={props.editorCompletionQuery}
        completionLeft={props.editorCompletionLeft}
        completionTop={props.editorCompletionTop}
        completionSuggestions={props.editorCompletionSuggestions}
        completionFocusIdx={props.editorCompletionFocusIdx}
    />;
}

const App = (props: AppProps) => (
    <div className="app-root">
        <SideMenu user={props.user} timeline={props.timeline}/>
        <div className="app-root__main">
            {renderEditor(props)}
            <Timeline items={props.items} message={props.message}/>
        </div>
    </div>
);

function select(state: State): AppProps {
    'use strict';
    return {
        items: state.current_items,
        message: state.current_message,
        user: state.current_user,
        timeline: state.current_timeline,
        editor: state.editor,
        editorOpen: state.editor_open,
        editorKeybinds: state.editor_keybinds,
        editorCompletionLabel: state.editor_completion_label,
        editorCompletionQuery: state.editor_completion_query,
        editorCompletionLeft: state.editor_completion_left,
        editorCompletionTop: state.editor_completion_top,
        editorCompletionSuggestions: state.editor_completion_suggestions,
        editorCompletionFocusIdx: state.editor_completion_focus_idx,
        inReplyTo: state.editor_in_reply_to_status,
    };
}

export default connect(select)(App);
