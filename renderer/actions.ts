import Tweet from './item/tweet';
import Item from './item/item';
import Separator from './item/separator';

export enum Kind {
    AddTweetToTimeline,
    ShowMessage,
    DismissMessage,
    AddSeparator,
}

export interface Action {
    type: Kind;
    item?: Item;
    text?: string;
    msg_kind?: MessageKind;
}

export function addTweetToTimeline(item: Tweet) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddTweetToTimeline,
            item,
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

export function addSeparator() {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddSeparator,
            item: new Separator(),
        }));
    };
}
