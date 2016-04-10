import {Action, Kind} from './actions';
import {List} from 'immutable';
import assign = require('object-assign');

export interface State {
    current_tweets: List<TweetStatus>;
}

const init: State = {
    current_tweets: List<TweetStatus>(),
};

export default function root(state: State = init, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.AddTweetToTimeline: {
            const next_state = assign({}, state) as State;
            next_state.current_tweets = state.current_tweets.unshift(action.tweet);
            return next_state;
        }
        default:
            break;
    }
    return state;
}
