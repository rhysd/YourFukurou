import {List} from 'immutable';
import assign = require('object-assign');
import {EditorState, Modifier, CompositeDecorator, SelectionState} from 'draft-js';
import {Action, Kind} from './actions';
import log from './log';
import Item from './item/item';
import Tweet, {TwitterUser} from './item/tweet';
import Separator from './item/separator';
import EditorKeybinds from './keybinds/editor';
import createScreenNameDecorator from './components/tweet/editor/screen_name_decorator';
import createHashtagDecorator from './components/tweet/editor/hashtag_decorator';
import autoCompleteFactory, {AutoCompleteLabel} from './components/tweet/editor/auto_complete_decorator';

const electron = global.require('electron');
const ipc = electron.ipcRenderer;

// Note:
// These are currently created statically.  But actually they should be created dynamically
// with the state of reducer.
const editorDecolator = new CompositeDecorator([
    createScreenNameDecorator(),
    createHashtagDecorator(),
    autoCompleteFactory(/:(?:[a-zA-Z0-9_\-\+]+):?/g, 'EMOJI'),
]);

function sendToMain(ch: ChannelFromRenderer, ...args: any[]) {
    'use strict';
    ipc.send(ch, ...args);
}

export interface State {
    current_items: List<Item>;
    current_message: MessageInfo;
    current_user: TwitterUser;

    editor: EditorState;
    editor_open: boolean;
    editor_keybinds: EditorKeybinds;
    editor_in_reply_to_status: Tweet;
    editor_completion_query: string;
    editor_completion_label: AutoCompleteLabel;
    editor_completion_top: number;
    editor_completion_left: number;
}

const init: State = {
    current_items: List<Item>(),
    current_message: null,
    current_user: null,
    editor: EditorState.createEmpty(editorDecolator),
    editor_open: false,
    editor_keybinds: new EditorKeybinds(),
    editor_in_reply_to_status: null,
    editor_completion_query: null,
    editor_completion_label: null,
    editor_completion_top: 0,
    editor_completion_left: 0,
};

function updateStatus(items: List<Item>, status: Tweet) {
    'use strict';
    return items.map(item => {
        if (item instanceof Tweet) {
            const id = item.getMainStatus().id;
            if (id === status.id) {
                if (item.isRetweet()) {
                    const cloned = item.clone();
                    cloned.json.retweeted_status = status.json;
                    return cloned;
                } else {
                    return status;
                }
            }
        }
        return item;
    }).toList();
}

function resetCompletionState(s: State) {
    'use strict';
    s.editor_completion_query = null;
    s.editor_completion_label = null;
    s.editor_completion_left = 0;
    s.editor_completion_top = 0;
    return s;
}

export default function root(state: State = init, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.ChangeEditorState: {
            const next_state = assign({}, state) as State;
            next_state.editor = action.editor;
            return next_state;
        }
        case Kind.AddTweetToTimeline: {
            const next_state = assign({}, state) as State;
            next_state.current_items = state.current_items.unshift(action.item);
            return next_state;
        }
        case Kind.ShowMessage: {
            const next_state = assign({}, state) as State;
            next_state.current_message = {
                text: action.text,
                kind: action.msg_kind,
            };
            return next_state;
        }
        case Kind.DismissMessage: {
            const next_state = assign({}, state) as State;
            next_state.current_message = null;
            return next_state;
        }
        case Kind.AddSeparator: {
            if (state.current_items.last() instanceof Separator) {
                // Note:
                // Do not add multiple separators continuously
                return state;
            }
            const next_state = assign({}, state) as State;
            next_state.current_items = state.current_items.unshift(action.item);
            return next_state;
        }
        case Kind.SendRetweet: {
            // Note:
            // The retweeted status will be sent on stream
            sendToMain('yf:request-retweet', action.tweet_id);
            return state;
        }
        case Kind.UndoRetweet: {
            sendToMain('yf:undo-retweet', action.tweet_id);
            return state;
        }
        case Kind.RetweetSucceeded: {
            const next_state = assign({}, state) as State;
            next_state.current_items = updateStatus(state.current_items, action.status.getMainStatus());
            return next_state;
        }
        case Kind.UnretweetSucceeded: {
            const next_state = assign({}, state) as State;
            next_state.current_items = updateStatus(state.current_items, action.status);
            return next_state;
        }
        case Kind.CreateLike: {
            // Note:
            // The likeed status will be sent on stream
            sendToMain('yf:request-like', action.tweet_id);
            return state;
        }
        case Kind.DestroyLike: {
            sendToMain('yf:destroy-like', action.tweet_id);
            return state;
        }
        case Kind.LikeSucceeded: {
            const next_state = assign({}, state) as State;
            next_state.current_items = updateStatus(state.current_items, action.status);
            return next_state;
        }
        case Kind.UnlikeSucceeded: {
            const next_state = assign({}, state) as State;
            next_state.current_items = updateStatus(state.current_items, action.status);
            return next_state;
        }
        case Kind.SetCurrentUser: {
            const next_state = assign({}, state) as State;
            next_state.current_user = action.user;
            return next_state;
        }
        case Kind.DeleteStatus: {
            const id = action.tweet_id;
            const next_state = assign({}, state) as State;
            next_state.current_items = state.current_items.filter(
                item => {
                    if (item instanceof Tweet) {
                        const s = item.getMainStatus();
                        if (s.id === id) {
                            log.debug('Deleted status:', s);
                            return false;
                        }
                    }
                    return true;
                }
            ).toList();
            return next_state;
        }
        case Kind.OpenEditor: {
            const next_state = assign({}, state) as State;
            next_state.editor_open = true;
            next_state.editor_in_reply_to_status = action.status;
            if (next_state.editor_in_reply_to_status === null) {
                return;
            }

            const next_content
                = Modifier.replaceText(
                    state.editor.getCurrentContent(),
                    state.editor.getSelection(),
                    `@${action.status.getMainStatus().user.screen_name} `
                );
            next_state.editor = EditorState.moveSelectionToEnd(
                EditorState.push(
                    state.editor,
                    next_content,
                    'insert-characters'
                )
            );

            return next_state;
        }
        case Kind.CloseEditor: {
            const next_state = assign({}, state) as State;
            next_state.editor_open = false;
            next_state.editor_in_reply_to_status = null;
            next_state.editor = EditorState.push(
                state.editor,
                Modifier.replaceText(
                    state.editor.getCurrentContent(),
                    state.editor.getSelection(),
                    ''
                ),
                'remove-range'
            );
            return next_state;
        }
        case Kind.ToggleEditor: {
            const next_state = assign({}, state) as State;
            next_state.editor_open = !state.editor_open;
            next_state.editor_in_reply_to_status = next_state.editor_open ?  action.status : null;
            return next_state;
        }
        case Kind.UpdateStatus: {
            const next_state = assign({}, state) as State;

            // Note:
            // Add more status information (e.g. picture to upload)
            sendToMain('yf:update-status', action.text, action.in_reply_to_id);

            // Note: Reset context to clear text input
            next_state.editor = EditorState.createEmpty(editorDecolator);
            next_state.editor_in_reply_to_status = null;

            return next_state;
        }
        case Kind.UpdateAutoCompletion: {
            const next_state = assign({}, state) as State;
            if (action.query === state.editor_completion_query) {
                // When overlapping queries, it means that completion was done.
                return resetCompletionState(next_state);
            }
            next_state.editor_completion_query = action.query;
            next_state.editor_completion_label = action.completion_label;
            next_state.editor_completion_left = action.left;
            next_state.editor_completion_top = action.top;
            return next_state;
        }
        case Kind.SelectAutoCompleteSuggestion: {
            const selection = state.editor.getSelection();
            const offset = selection.getAnchorOffset() - 1;
            const content = state.editor.getCurrentContent();
            const block_text = content.getBlockForKey(selection.getAnchorKey()).getText();
            const idx = block_text.lastIndexOf(action.query, offset);
            if (idx === -1 || (idx + action.query.length < offset)) {
                return state;
            }
            const next_selection = selection.merge({
                anchorOffset: idx,
                focusOffset: idx + action.query.length,
            }) as SelectionState;
            const next_content = Modifier.replaceText(content, next_selection, action.text);
            const next_editor = EditorState.push(
                state.editor,
                next_content,
                'insert-characters'
            );
            const next_state = resetCompletionState(assign({}, state) as State);
            next_state.editor = next_editor;
            return next_state;
        }
        case Kind.StopAutoCompletion: {
            return resetCompletionState(assign({}, state) as State);
        }
        default:
            break;
    }
    return state;
}
