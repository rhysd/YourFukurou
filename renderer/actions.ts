import Tweet from './item/tweet';

export enum Kind {
    AddTweetToTimeline,
}

export interface Action {
    type: Kind;
    tweet?: Tweet;
}

export function addTweetToTimeline(tweet: Tweet) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddTweetToTimeline,
            tweet,
        }));
    };
}
