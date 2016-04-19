import Tweet, {TwitterUser} from './item/tweet';
import Item from './item/item';
import Separator from './item/separator';

export enum Kind {
    ShowMessage,
    DismissMessage,
    AddSeparator,

    AddTweetToTimeline,
    SetCurrentUser,
    DeleteStatus,

    SendRetweet,
    UndoRetweet,
    RetweetSucceeded,
    UnretweetSucceeded,

    CreateLike,
    DestroyLike,
    LikeSucceeded,
    UnlikeSucceeded,
}

export interface Action {
    type: Kind;
    item?: Item;
    text?: string;
    msg_kind?: MessageKind;
    tweet_id?: string;
    status?: Tweet;
    user?: TwitterUser;
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

export function sendRetweet(tweet_id: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.SendRetweet,
            tweet_id,
        }));
    };
}

export function undoRetweet(tweet_id: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UndoRetweet,
            tweet_id,
        }));
    };
}

export function retweetSucceeded(status: Tweet) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.RetweetSucceeded,
            status,
        }));
    };
}

export function unretweetSucceeded(status: Tweet) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UnretweetSucceeded,
            status,
        }));
    };
}

export function createLike(tweet_id: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.CreateLike,
            tweet_id,
        }));
    };
}

export function destroyLike(tweet_id: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.DestroyLike,
            tweet_id,
        }));
    };
}

export function likeSucceeded(status: Tweet) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.LikeSucceeded,
            status,
        }));
    };
}

export function unlikeSucceeded(status: Tweet) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UnlikeSucceeded,
            status,
        }));
    };
}

export function setCurrentUser(user: TwitterUser) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.SetCurrentUser,
            user,
        }));
    };
}

export function deleteStatus(tweet_id: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.DeleteStatus,
            tweet_id,
        }));
    };
}
