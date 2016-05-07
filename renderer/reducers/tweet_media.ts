import {Twitter} from 'twit';
import {Action, Kind} from '../actions';

export interface TweetMediaState {
    index: number;
    entities: Twitter.MediaEntity[];
}

export default function tweetMedia(state: TweetMediaState = null, action: Action) {
    'use strict';
    switch (action.type) {
        case Kind.OpenTweetMedia:
            return {
                index: action.index || 0,
                entities: action.media_entities,
            };
        case Kind.CloseTweetMedia:
            return null;
        case Kind.MoveToNthTweetMedia:
            return {
                index: action.index,
                entities: state.entities,
            };
        default:
            return state;
    }
}
