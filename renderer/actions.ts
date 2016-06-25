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
    AddTweetsToTimeline,
    SetCurrentUser,
    UpdateCurrentUser,
    DeleteStatusInTimeline,
    AddMentions,
    AddRejectedUserIds,
    RemoveRejectedUserIds,
    AddNoRetweetUserIds,

    RetweetSucceeded,
    UnretweetSucceeded,
    LikeSucceeded,
    UnlikeSucceeded,
    StatusLiked,

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
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddTweetToTimeline,
            status,
        }));
    };
}

export function addTweetsToTimeline(statuses: Tweet[]) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddTweetsToTimeline,
            statuses,
        }));
    };
}

export function addMentions(mentions: Tweet[]) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddMentions,
            mentions,
        }));
    };
}

export function addRejectedUserIds(ids: number[]) {
    return {
        type: Kind.AddRejectedUserIds,
        ids,
    };
}

export function removeRejectedUserIds(ids: number[]) {
    return {
        type: Kind.RemoveRejectedUserIds,
        ids,
    };
}

export function addNoRetweetUserIds(ids: number[]) {
    return {
        type: Kind.AddNoRetweetUserIds,
        ids,
    };
}

export function showMessage(text: string, msg_kind: MessageKind) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.ShowMessage,
            text,
            msg_kind,
        }));
    };
}

export function dismissMessage() {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.DismissMessage,
        }));
    };
}

export function notImplementedYet() {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.NotImplementedYet,
        }));
    };
}

export function addSeparator() {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.AddSeparator,
            item: new Separator(),
        }));
    };
}

export function retweetSucceeded(status: Tweet) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.RetweetSucceeded,
            status,
        }));
    };
}

export function unretweetSucceeded(status: Tweet) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UnretweetSucceeded,
            status,
        }));
    };
}

export function likeSucceeded(status: Tweet) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.LikeSucceeded,
            status,
        }));
    };
}

export function unlikeSucceeded(status: Tweet) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UnlikeSucceeded,
            status,
        }));
    };
}

export function statusLiked(status: Tweet, from: TwitterUser) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.StatusLiked,
            user: from,
            status,
        }));
    };
}

export function setCurrentUser(user: TwitterUser) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.SetCurrentUser,
            user,
        }));
    };
}

export function updateCurrentUser(user_json: Twitter.User) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.UpdateCurrentUser,
            user_json,
        }));
    };
}

export function deleteStatusInTimeline(tweet_id: string) {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.DeleteStatusInTimeline,
            tweet_id,
        }));
    };
}

export function changeEditorState(editor: EditorState) {
    return {
        type: Kind.ChangeEditorState,
        editor,
    };
}

export function openEditor(text?: string) {
    return {
        type: Kind.OpenEditor,
        text,
    };
}

export function openEditorForReply(in_reply_to: Tweet, owner: TwitterUser, text?: string) {
    return {
        type: Kind.OpenEditorForReply,
        status: in_reply_to,
        user: owner,
        text,
    };
}

export function closeEditor() {
    return {
        type: Kind.CloseEditor,
    };
}

export function toggleEditor() {
    return (dispatch: Redux.Dispatch) => {
        setImmediate(() => dispatch({
            type: Kind.ToggleEditor,
        }));
    };
}

export function selectAutoCompleteSuggestion(text: string, query: string) {
    return {
        type: Kind.SelectAutoCompleteSuggestion,
        text,
        query,
    };
}

export function updateAutoCompletion(left: number, top: number, query: string, label: AutoCompleteLabel) {
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
            .catch((e: Error) => log.error('updateAutoCompletion():', e));
    };
}

export function stopAutoCompletion() {
    return {
        type: Kind.StopAutoCompletion,
    };
}

export function downAutoCompletionFocus() {
    return {
        type: Kind.DownAutoCompletionFocus,
    };
}

export function upAutoCompletionFocus() {
    return {
        type: Kind.UpAutoCompletionFocus,
    };
}

export function changeCurrentTimeline(timeline: TimelineKind) {
    return {
        type: Kind.ChangeCurrentTimeline,
        timeline,
    };
}

export function openPicturePreview(media_urls: string[], index?: number) {
    return {
        type: Kind.OpenPicturePreview,
        media_urls,
        index,
    };
}

export function closeTweetMedia() {
    return {
        type: Kind.CloseTweetMedia,
    };
}

export function moveToNthPicturePreview(index: number) {
    return {
        type: Kind.MoveToNthPicturePreview,
        index,
    };
}

export function focusOnItem(index: number) {
    return {
        type: Kind.FocusOnItem,
        index,
    };
}

export function unfocusItem() {
    return {
        type: Kind.UnfocusItem,
    };
}

export function focusNextItem() {
    return {
        type: Kind.FocusNextItem,
    };
}

export function focusPrevItem() {
    return {
        type: Kind.FocusPrevItem,
    };
}

export function focusTopItem() {
    return {
        type: Kind.FocusTopItem,
    };
}

export function focusBottomItem() {
    return {
        type: Kind.FocusBottomItem,
    };
}

export function addFriends(ids: number[]) {
    return {
        type: Kind.AddFriends,
        ids,
    };
}

export function removeFriends(ids: number[]) {
    return {
        type: Kind.RemoveFriends,
        ids,
    };
}

export function openUserTimeline(user: TwitterUser) {
    return {
        type: Kind.OpenUserTimeline,
        user,
    };
}

export function closeSlaveTimeline() {
    return {
        type: Kind.CloseSlaveTimeline,
    };
}

export function addUserTweets(user_id: number, statuses: Tweet[]) {
    return {
        type: Kind.AddUserTweets,
        user_id,
        statuses,
    };
}

export function focusSlaveNext() {
    return {
        type: Kind.FocusSlaveNext,
    };
}

export function focusSlavePrev() {
    return {
        type: Kind.FocusSlavePrev,
    };
}

export function focusSlaveTop() {
    return {
        type: Kind.FocusSlaveTop,
    };
}

export function focusSlaveBottom() {
    return {
        type: Kind.FocusSlaveBottom,
    };
}

export function focusSlaveOn(index: number) {
    return {
        type: Kind.FocusSlaveOn,
        index,
    };
}

export function blurSlaveTimeline() {
    return {
        type: Kind.BlurSlaveTimeline,
    };
}

