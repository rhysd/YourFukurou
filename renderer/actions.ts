export enum Kind {
    AddTweetToTimeline,
}

export interface Action {
    type: Kind;
    tweet?: Object;
}

export function addTweetToTimeline(tweet: Object) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddTweetToTimeline,
            tweet,
        }));
    };
}
