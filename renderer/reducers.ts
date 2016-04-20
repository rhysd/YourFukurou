import {List} from 'immutable';
import assign = require('object-assign');
import {EditorState} from 'draft-js';
import {Action, Kind} from './actions';
import Item from './item/item';
import Tweet, {TwitterUser} from './item/tweet';
import Separator from './item/separator';

const electron = global.require('electron');
const ipc = electron.ipcRenderer;

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
}

const init: State = {
    current_items: List<Item>(),
    current_message: null,
    current_user: null,
    editor: EditorState.createEmpty(),
    editor_open: false,
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

export default function root(state: State = init, action: Action) {
    'use strict';
    switch (action.type) {
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
                item => item instanceof Tweet
                    ? item.getMainStatus().id !== id
                    : true
            ).toList();
            return next_state;
        }
        case Kind.OpenEditor: {
            const next_state = assign({}, state) as State;
            next_state.editor_open = true;
            return next_state;
        }
        case Kind.SaveAndCloseEditor: {
            const next_state = assign({}, state) as State;
            next_state.editor = action.editor;
            next_state.editor_open = false;
            return next_state;
        }
        default:
            break;
    }
    return state;
}
