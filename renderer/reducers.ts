import {Action} from './actions';

export interface State {
}

const init: State = {};

export default function root(state: State = init, action: Action) {
    'use strict';
    return state;
}
