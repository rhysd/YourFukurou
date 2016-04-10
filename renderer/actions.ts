export enum Kind {
    AddTweetToTimeline,
}

export interface Action {
    type: Kind;
    tweet?: TweetStatus;
}

export function addTweetToTimeline(tweet: TweetStatus) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddTweetToTimeline,
            tweet,
        }));
    };
}
