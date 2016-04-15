import {List} from 'immutable';
import assign = require('object-assign');
import {Action, Kind} from './actions';
import Item from './item/item';

export interface State {
    current_items: List<Item>;
}

const init: State = {
    current_items: List<Item>(),
};

export default function root(state: State = init, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.AddTweetToTimeline: {
            const next_state = assign({}, state) as State;
            next_state.current_items = state.current_items.unshift(action.tweet);
            return next_state;
        }
        default:
            break;
    }
    return state;
}
