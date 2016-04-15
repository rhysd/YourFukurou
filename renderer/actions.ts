import Tweet from './item/tweet';

export enum Kind {
    AddTweetToTimeline,
    ShowMessage,
    DismissMessage,
}

export interface Action {
    type: Kind;
    tweet?: Tweet;
    text?: string;
    msg_kind?: MessageKind;
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

export function showMessage(text: string, msg_kind: MessageKind) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.ShowMessage,
            text,
            msg_kind,
        }));
    };
}

export function dismissMessage() {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.DismissMessage,
        }));
    };
}
