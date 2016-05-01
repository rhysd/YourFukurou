import {EditorState} from 'draft-js';
import Tweet, {TwitterUser} from './item/tweet';
import Item from './item/item';
import Separator from './item/separator';
import {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import {TimelineKind} from './states/timeline';
import {MessageKind} from './reducers/message';

export enum Kind {
    ShowMessage,
    DismissMessage,
    AddSeparator,
    ChangeCurrentTimeline,

    AddTweetToTimeline,
    SetCurrentUser,
    DeleteStatusInTimeline,
    AddMentions,

    SendRetweet,
    UndoRetweet,
    RetweetSucceeded,
    UnretweetSucceeded,
    DestroyStatus,

    CreateLike,
    DestroyLike,
    LikeSucceeded,
    UnlikeSucceeded,

    ChangeEditorState,
    OpenEditor,
    CloseEditor,
    ToggleEditor,

    UpdateStatus,

    SelectAutoCompleteSuggestion,
    UpdateAutoCompletion,
    StopAutoCompletion,
    DownAutoCompletionFocus,
    UpAutoCompletionFocus,
}

export interface Action {
    type: Kind;
    item?: Item;
    text?: string;
    msg_kind?: MessageKind;
    tweet_id?: string;
    status?: Tweet;
    user?: TwitterUser;
    editor?: EditorState;
    in_reply_to_id?: string;
    query?: string;
    left?: number;
    top?: number;
    completion_label?: AutoCompleteLabel;
    timeline?: TimelineKind;
    mentions?: Tweet[];
}

export function addTweetToTimeline(status: Tweet) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddTweetToTimeline,
            status,
        }));
    };
}

export function addMentions(mentions: Tweet[]) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddMentions,
            mentions,
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

export function destroyStatus(tweet_id: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.DestroyStatus,
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

export function deleteStatusInTimeline(tweet_id: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.DeleteStatusInTimeline,
            tweet_id,
        }));
    };
}

export function changeEditorState(editor: EditorState) {
    'use strict';
    return {
        type: Kind.ChangeEditorState,
        editor,
    };
}

export function openEditor(in_reply_to: Tweet = null) {
    'use strict';
    return {
        type: Kind.OpenEditor,
        status: in_reply_to,
    };
}

export function closeEditor() {
    'use strict';
    return {
        type: Kind.CloseEditor,
    };
}

export function toggleEditor(in_reply_to: Tweet = null) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.ToggleEditor,
            status: in_reply_to,
        }));
    };
}

export function updateStatus(text: string, in_reply_to_id?: string) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UpdateStatus,
            text,
            in_reply_to_id,
        }));
    };
}

export function selectAutoCompleteSuggestion(text: string, query: string) {
    'use strict';
    return {
        type: Kind.SelectAutoCompleteSuggestion,
        text,
        query,
    };
}

export function updateAutoCompletion(left: number, top: number, query: string, completion_label: AutoCompleteLabel) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UpdateAutoCompletion,
            left,
            top,
            query,
            completion_label,
        }));
    };
}

export function stopAutoCompletion() {
    'use strict';
    return {
        type: Kind.StopAutoCompletion,
    };
}

export function downAutoCompletionFocus() {
    'use strict';
    return {
        type: Kind.DownAutoCompletionFocus,
    };
}

export function upAutoCompletionFocus() {
    'use strict';
    return {
        type: Kind.UpAutoCompletionFocus,
    };
}

export function changeCurrentTimeline(timeline: TimelineKind) {
    'use strict';
    return {
        type: Kind.ChangeCurrentTimeline,
        timeline,
    };
}
