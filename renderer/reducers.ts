import {List} from 'immutable';
import assign = require('object-assign');
import {Action, Kind} from './actions';
import Item from './item/item';

export interface State {
    current_items: List<Item>;
    current_message: MessageInfo;
}

const init: State = {
    current_items: List<Item>(),
    current_message: null,
};

export default function root(state: State = init, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.AddTweetToTimeline: {
            const next_state = assign({}, state) as State;
            next_state.current_items = state.current_items.unshift(action.tweet);
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
        default:
            break;
    }
    return state;
}
