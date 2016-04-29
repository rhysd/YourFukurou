import assign = require('object-assign');
import {Action, Kind} from '../actions';
import {EditorState, Modifier, CompositeDecorator, SelectionState, ContentState} from 'draft-js';
import Tweet from '../item/tweet';
import EditorKeymaps from '../keybinds/editor';
import autoCompleteFactory from '../components/editor/auto_complete_decorator';
import createScreenNameDecorator from '../components/editor/screen_name_decorator';
import createHashtagDecorator from '../components/editor/hashtag_decorator';
import log from '../log';

const electron = global.require('electron');
const ipc = electron.ipcRenderer;

// Note:
// These are currently created statically.  But actually they should be created dynamically
// with the state of reducer.
const editorDecolator = new CompositeDecorator([
    createScreenNameDecorator(),  // XXX: Temporary
    createHashtagDecorator(),     // XXX: Temporary
    autoCompleteFactory(/:(?:[a-zA-Z0-9_\-\+]+):?/g, 'EMOJI'),
]);

function sendToMain(ch: ChannelFromRenderer, ...args: any[]) {
    'use strict';
    ipc.send(ch, ...args);
}

function openEditor(state: TweetEditorState, status: Tweet) {
    'use strict';
    const next_state = assign({}, state) as TweetEditorState;
    next_state.is_open = true;
    next_state.in_reply_to_status = status;
    if (next_state.in_reply_to_status === null) {
        return next_state;
    }

    next_state.core = EditorState.moveSelectionToEnd(
        EditorState.push(
            state.core,
            ContentState.createFromText(`@${status.getMainStatus().user.screen_name} `),
            'insert-characters'
        )
    );

    return next_state;
}

function closeEditor(state: TweetEditorState) {
    'use strict';
    const next_state = assign({}, state) as TweetEditorState;
    next_state.is_open = false;
    next_state.in_reply_to_status = null;
    next_state.core = EditorState.push(
        state.core,
        ContentState.createFromText(''),
        'remove-range'
    );
    return next_state;
}

export interface TweetEditorState {
    core: EditorState;
    is_open: boolean;
    keymaps: EditorKeymaps;
    in_reply_to_status: Tweet;
}

const InitTweetEditorState: TweetEditorState = {
    core: EditorState.createEmpty(editorDecolator),
    is_open: false,
    keymaps: new EditorKeymaps(),
    in_reply_to_status: null,
};

export default function editor(state: TweetEditorState = InitTweetEditorState, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.ChangeEditorState: {
            const next_state = assign({}, state) as TweetEditorState;
            next_state.core = action.editor;
            return next_state;
        }
        case Kind.UpdateStatus: {
            const next_state = assign({}, state) as TweetEditorState;

            // Note:
            // Add more status information (e.g. picture to upload)
            sendToMain('yf:update-status', action.text, action.in_reply_to_id);

            // Note: Reset context to clear text input
            next_state.core = EditorState.createEmpty(editorDecolator);
            next_state.in_reply_to_status = null;

            return next_state;
        }
        case Kind.SelectAutoCompleteSuggestion: {
            const selection = state.core.getSelection();
            const offset = selection.getAnchorOffset() - 1;
            const content = state.core.getCurrentContent();
            const block_text = content.getBlockForKey(selection.getAnchorKey()).getText();
            const idx = block_text.lastIndexOf(action.query, offset);

            if (idx === -1 || (idx + action.query.length < offset)) {
                log.error('Invalid selection:', selection);
                return state;
            }

            const next_selection = selection.merge({
                anchorOffset: idx,
                focusOffset: idx + action.query.length,
            }) as SelectionState;
            const next_content = Modifier.replaceText(content, next_selection, action.text);
            const next_editor = EditorState.forceSelection(
                EditorState.push(
                    state.core,
                    next_content,
                    'insert-characters'
                ),
                next_content.getSelectionAfter()
            );

            const next_state = assign({}, state) as TweetEditorState;
            next_state.core = next_editor;
            return next_state;
        }
        case Kind.OpenEditor: {
            return openEditor(state, action.status);
        }
        case Kind.CloseEditor: {
            return closeEditor(state);
        }
        case Kind.ToggleEditor: {
            if (state.is_open) {
                return closeEditor(state);
            } else {
                return openEditor(state, action.status);
            }
        }
        default: {
            return state;
        }
    }
}

