import {EditorState} from 'draft-js';
import {Twitter} from 'twit';
import Tweet, {TwitterUser} from './item/tweet';
import Item from './item/item';
import Separator from './item/separator';
import {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import {TimelineKind} from './states/timeline';
import {MessageKind} from './reducers/message';
import {searchSuggestionItems, SuggestionItem} from './components/editor/suggestions';
import log from './log';

export enum Kind {
    AddSeparator,
    ChangeCurrentTimeline,

    ShowMessage,
    DismissMessage,
    NotImplementedYet,

    AddTweetToTimeline,
    SetCurrentUser,
    UpdateCurrentUser,
    DeleteStatusInTimeline,
    AddMentions,
    AddRejectedUserIds,
    RemoveRejectedUserIds,
    AddNoRetweetUserIds,

    SendRetweet,
    UndoRetweet,
    RetweetSucceeded,
    UnretweetSucceeded,
    UpdateStatus,
    DestroyStatus,
    CreateLike,
    DestroyLike,
    LikeSucceeded,
    UnlikeSucceeded,
    StatusLiked,
    Follow,
    Unfollow,

    ChangeEditorState,
    OpenEditor,
    OpenEditorForReply,
    CloseEditor,
    ToggleEditor,

    SelectAutoCompleteSuggestion,
    UpdateAutoCompletion,
    StopAutoCompletion,
    DownAutoCompletionFocus,
    UpAutoCompletionFocus,

    OpenPicturePreview,
    CloseTweetMedia,
    MoveToNthPicturePreview,

    FocusOnItem,
    UnfocusItem,
    FocusNextItem,
    FocusPrevItem,
    FocusTopItem,
    FocusBottomItem,

    AddFriends,
    RemoveFriends,

    OpenUserTimeline,
    CloseSlaveTimeline,
    AddUserTweets,
    BlurSlaveTimeline,
    FocusSlaveNext,
    FocusSlavePrev,
    FocusSlaveTop,
    FocusSlaveBottom,
    FocusSlaveOn,
}

export interface Action {
    type: Kind;
    item?: Item;
    text?: string;
    msg_kind?: MessageKind;
    tweet_id?: string;
    status?: Tweet;
    statuses?: Tweet[];
    user?: TwitterUser;
    user_json?: Twitter.User;
    editor?: EditorState;
    in_reply_to_id?: string;
    query?: string;
    left?: number;
    top?: number;
    timeline?: TimelineKind;
    mentions?: Tweet[];
    completion_label?: AutoCompleteLabel;
    suggestions?: SuggestionItem[];
    ids?: number[];
    index?: number;
    media_urls?: string[];
    user_id?: number;
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

export function addRejectedUserIds(ids: number[]) {
    'use strict';
    return {
        type: Kind.AddRejectedUserIds,
        ids,
    };
}

export function removeRejectedUserIds(ids: number[]) {
    'use strict';
    return {
        type: Kind.RemoveRejectedUserIds,
        ids,
    };
}

export function addNoRetweetUserIds(ids: number[]) {
    'use strict';
    return {
        type: Kind.AddNoRetweetUserIds,
        ids,
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

export function notImplementedYet() {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.NotImplementedYet,
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

export function statusLiked(status: Tweet, from: TwitterUser) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.StatusLiked,
            user: from,
            status,
        }));
    };
}

export function follow(user_id: number) {
    'use strict';
    return {
        type: Kind.Follow,
        user_id,
    };
}

export function unfollow(user_id: number) {
    'use strict';
    return {
        type: Kind.Unfollow,
        user_id,
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

export function updateCurrentUser(user_json: Twitter.User) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UpdateCurrentUser,
            user_json,
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

export function openEditor() {
    'use strict';
    return {
        type: Kind.OpenEditor,
    };
}

export function openEditorForReply(in_reply_to: Tweet, owner: TwitterUser) {
    'use strict';
    return {
        type: Kind.OpenEditorForReply,
        status: in_reply_to,
        user: owner,
    };
}

export function closeEditor() {
    'use strict';
    return {
        type: Kind.CloseEditor,
    };
}

export function toggleEditor() {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.ToggleEditor,
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

export function updateAutoCompletion(left: number, top: number, query: string, label: AutoCompleteLabel) {
    'use strict';
    return (dispatch: Redux.Dispatch) => {
        searchSuggestionItems(query, label)
            .then(suggestions => dispatch({
                type: Kind.UpdateAutoCompletion,
                left,
                top,
                query,
                suggestions,
                completion_label: label,
            }))
            .catch(e => log.error('updateAutoCompletion():', e));
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

export function openPicturePreview(media_urls: string[], index?: number) {
    'use strict';
    return {
        type: Kind.OpenPicturePreview,
        media_urls,
        index,
    };
}

export function closeTweetMedia() {
    'use strict';
    return {
        type: Kind.CloseTweetMedia,
    };
}

export function moveToNthPicturePreview(index: number) {
    'use strict';
    return {
        type: Kind.MoveToNthPicturePreview,
        index,
    };
}

export function focusOnItem(index: number) {
    'use strict';
    return {
        type: Kind.FocusOnItem,
        index,
    };
}

export function unfocusItem() {
    'use strict';
    return {
        type: Kind.UnfocusItem,
    };
}

export function focusNextItem() {
    'use strict';
    return {
        type: Kind.FocusNextItem,
    };
}

export function focusPrevItem() {
    'use strict';
    return {
        type: Kind.FocusPrevItem,
    };
}

export function focusTopItem() {
    'use strict';
    return {
        type: Kind.FocusTopItem,
    };
}

export function focusBottomItem() {
    'use strict';
    return {
        type: Kind.FocusBottomItem,
    };
}

export function addFriends(ids: number[]) {
    'use strict';
    return {
        type: Kind.AddFriends,
        ids,
    };
}

export function removeFriends(ids: number[]) {
    'use strict';
    return {
        type: Kind.RemoveFriends,
        ids,
    };
}

export function openUserTimeline(user: TwitterUser) {
    'use strict';
    return {
        type: Kind.OpenUserTimeline,
        user,
    };
}

export function closeSlaveTimeline() {
    'use strict';
    return {
        type: Kind.CloseSlaveTimeline,
    };
}

export function addUserTweets(user_id: number, statuses: Tweet[]) {
    'use strict';
    return {
        type: Kind.AddUserTweets,
        user_id,
        statuses,
    };
}

export function focusSlaveNext() {
    'use strict';
    return {
        type: Kind.FocusSlaveNext,
    };
}

export function focusSlavePrev() {
    'use strict';
    return {
        type: Kind.FocusSlavePrev,
    };
}

export function focusSlaveTop() {
    'use strict';
    return {
        type: Kind.FocusSlaveTop,
    };
}

export function focusSlaveBottom() {
    'use strict';
    return {
        type: Kind.FocusSlaveBottom,
    };
}

export function focusSlaveOn(index: number) {
    'use strict';
    return {
        type: Kind.FocusSlaveOn,
        index,
    };
}

export function blurSlaveTimeline() {
    'use strict';
    return {
        type: Kind.BlurSlaveTimeline,
    };
}

