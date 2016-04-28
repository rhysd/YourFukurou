import {List} from 'immutable';
import assign = require('object-assign');
import {EditorState, Modifier, CompositeDecorator, SelectionState, ContentState} from 'draft-js';
import {Action, Kind} from './actions';
import log from './log';
import Item from './item/item';
import Tweet, {TwitterUser} from './item/tweet';
import Separator from './item/separator';
import EditorKeymaps from './keybinds/editor';
import createScreenNameDecorator from './components/editor/screen_name_decorator';
import createHashtagDecorator from './components/editor/hashtag_decorator';
import autoCompleteFactory, {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import {searchSuggestionItems, SuggestionItem} from './components/editor/suggestions';

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

export interface State {
    current_items: List<Item>;
    current_message: MessageInfo;
    current_user: TwitterUser;

    editor: EditorState;
    editor_open: boolean;
    editor_keybinds: EditorKeymaps;
    editor_in_reply_to_status: Tweet;

    editor_completion_query: string;
    editor_completion_label: AutoCompleteLabel;
    editor_completion_top: number;
    editor_completion_left: number;
    editor_completion_suggestions: SuggestionItem[];
    editor_completion_focus_idx: number;
}

const init: State = {
    current_items: List<Item>(),
    current_message: null,
    current_user: null,
    editor: EditorState.createEmpty(editorDecolator),
    editor_open: false,
    editor_keybinds: new EditorKeymaps(),
    editor_in_reply_to_status: null,
    editor_completion_query: null,
    editor_completion_label: null,
    editor_completion_top: 0,
    editor_completion_left: 0,
    editor_completion_suggestions: [],
    editor_completion_focus_idx: null,
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
    s.editor_completion_suggestions = [];
    s.editor_completion_focus_idx = null;
    return s;
}

function openEditor(state: State, status: Tweet) {
    'use strict';
    const next_state = assign({}, state) as State;
    next_state.editor_open = true;
    next_state.editor_in_reply_to_status = status;
    if (next_state.editor_in_reply_to_status === null) {
        return next_state;
    }

    next_state.editor = EditorState.moveSelectionToEnd(
        EditorState.push(
            state.editor,
            ContentState.createFromText(`@${status.getMainStatus().user.screen_name} `),
            'insert-characters'
        )
    );

    return next_state;
}

function closeEditor(state: State) {
    'use strict';
    const next_state = assign({}, state) as State;
    next_state.editor_open = false;
    next_state.editor_in_reply_to_status = null;
    next_state.editor = EditorState.push(
        state.editor,
        ContentState.createFromText(''),
        'remove-range'
    );
    return next_state;
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
            if (state.current_items.first() instanceof Separator) {
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
            return openEditor(state, action.status);
        }
        case Kind.CloseEditor: {
            return closeEditor(state);
        }
        case Kind.ToggleEditor: {
            if (state.editor_open) {
                return closeEditor(state);
            } else {
                return openEditor(state, action.status);
            }
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
            next_state.editor_completion_suggestions = searchSuggestionItems(action.query, action.completion_label);
            return next_state;
        }
        case Kind.SelectAutoCompleteSuggestion: {
            const selection = state.editor.getSelection();
            const offset = selection.getAnchorOffset() - 1;
            const content = state.editor.getCurrentContent();
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
                    state.editor,
                    next_content,
                    'insert-characters'
                ),
                next_content.getSelectionAfter()
            );
            const next_state = resetCompletionState(assign({}, state) as State);
            next_state.editor = next_editor;
            return next_state;
        }
        case Kind.StopAutoCompletion: {
            return resetCompletionState(assign({}, state) as State);
        }
        case Kind.DownAutoCompletionFocus: {
            if (state.editor_completion_label === null) {
                // Note: Suggestion not being selected
                return state;
            }
            const next_state = assign({}, state) as State;
            const i = state.editor_completion_focus_idx;
            if (i === null || i >= state.editor_completion_suggestions.length - 1) {
                next_state.editor_completion_focus_idx = 0;
            } else {
                next_state.editor_completion_focus_idx = i + 1;
            }
            return next_state;
        }
        case Kind.UpAutoCompletionFocus: {
            if (state.editor_completion_label === null) {
                // Note: Suggestion not being selected
                return state;
            }
            const next_state = assign({}, state) as State;
            const i = state.editor_completion_focus_idx;
            if (i === null || i <= 0) {
                next_state.editor_completion_focus_idx = state.editor_completion_suggestions.length - 1;
            } else {
                next_state.editor_completion_focus_idx = i - 1;
            }
            return next_state;
        }
        default:
            break;
    }
    return state;
}
