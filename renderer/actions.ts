import {EditorState} from 'draft-js';
import {Twitter} from 'twit';
import Tweet, {TwitterUser} from './item/tweet';
import Item from './item/item';
import {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import TimelineState, {TimelineKind} from './states/timeline';
import {MessageKind} from './reducers/message';
import {searchSuggestionItems, SuggestionItem} from './components/editor/suggestions';
import log from './log';
import State from './states/root';

export const Kind = {
    AddSeparator: Symbol('add-separator'),
    ChangeCurrentTimeline: Symbol('change-current-timeline'),

    ShowMessage: Symbol('show-message'),
    DismissMessage: Symbol('dismiss-message'),
    NotImplementedYet: Symbol('not-implemented-yet'),

    AddTweetToTimeline: Symbol('add-tweet-to-timeline'),
    AddTweetsToTimeline: Symbol('add-tweets-to-timeline'),
    SetCurrentUser: Symbol('set-current-user'),
    UpdateCurrentUser: Symbol('update-current-user'),
    DeleteStatusInTimeline: Symbol('delete-status-in-timeline'),
    AddMentions: Symbol('add-mentions'),
    AddRejectedUserIds: Symbol('add-rejected-user-ids'),
    RemoveRejectedUserIds: Symbol('remove-rejected-user-ids'),
    AddNoRetweetUserIds: Symbol('add-no-retweet-user-ids'),
    CompleteMissingStatuses: Symbol('complete-missing-statuses'),

    UpdateStatus: Symbol('update-status'),
    StatusLiked: Symbol('status-liked'),

    ChangeEditorState: Symbol('change-editor-state'),
    OpenEditor: Symbol('open-editor'),
    OpenEditorForReply: Symbol('open-editor-for-reply'),
    CloseEditor: Symbol('close-editor'),
    ToggleEditor: Symbol('toggle-editor'),

    SelectAutoCompleteSuggestion: Symbol('select-auto-complete-suggestion'),
    UpdateAutoCompletion: Symbol('update-auto-completion'),
    StopAutoCompletion: Symbol('stop-auto-completion'),
    DownAutoCompletionFocus: Symbol('down-auto-completion-focus'),
    UpAutoCompletionFocus: Symbol('up-auto-completion-focus'),

    OpenPicturePreview: Symbol('open-picture-preview'),
    CloseTweetMedia: Symbol('close-tweet-media'),
    MoveToNthPicturePreview: Symbol('move-to-nth-picture-preview'),

    FocusOnItem: Symbol('focus-on-item'),
    UnfocusItem: Symbol('unfocus-item'),
    FocusNextItem: Symbol('focus-next-item'),
    FocusPrevItem: Symbol('focus-prev-item'),
    FocusTopItem: Symbol('focus-top-item'),
    FocusBottomItem: Symbol('focus-bottom-item'),

    AddFriends: Symbol('add-friends'),
    RemoveFriends: Symbol('remove-friends'),
    ResetFriends: Symbol('reset-friends'),

    OpenUserTimeline: Symbol('open-user-timeline'),
    OpenConversationTimeline: Symbol('open-conversation-timeline'),
    CloseSlaveTimeline: Symbol('close-slave-timeline'),
    AddUserTweets: Symbol('add-user-tweets'),
    AppendPastItems: Symbol('append-past-items'),
    BlurSlaveTimeline: Symbol('blur-slave-timeline'),
    FocusSlaveNext: Symbol('focus-slave-next'),
    FocusSlavePrev: Symbol('focus-slave-prev'),
    FocusSlaveTop: Symbol('focus-slave-top'),
    FocusSlaveBottom: Symbol('focus-slave-bottom'),
    FocusSlaveOn: Symbol('focus-slave-on'),
};

export interface Action {
    type: symbol;
    item?: Item;
    items?: Item[];
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

    // XXX: Temporary!
    next_timeline: TimelineState;
}

type ThunkAction = (dispatch: Redux.Dispatch, getState: () => State) => void;

export function addTweetToTimeline(status: Tweet): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddTweetToTimeline,
            next_timeline: getState().timeline.addNewTweet(status),
        });
    };
}

export function addTweetsToTimeline(statuses: Tweet[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddTweetsToTimeline,
            next_timeline: getState().timeline.addNewTweets(statuses),
        });
    };
}

export function addMentions(mentions: Tweet[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddMentions,
            next_timeline: getState().timeline.addMentions(mentions),
        });
    };
}

export function addRejectedUserIds(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddRejectedUserIds,
            next_timeline: getState().timeline.addRejectedIds(ids),
        });
    };
}

export function removeRejectedUserIds(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.RemoveRejectedUserIds,
            next_timeline: getState().timeline.removeRejectedIds(ids),
        });
    };
}

export function addNoRetweetUserIds(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddNoRetweetUserIds,
            next_timeline: getState().timeline.addNoRetweetUserIds(ids),
        });
    };
}

export function completeMissingStatuses(timeline: TimelineKind, index: number, items: Item[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.CompleteMissingStatuses,
            next_timeline: getState().timeline.replaceSeparatorWithItems(timeline, index, items),
        });
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

export function addSeparator(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddSeparator,
        });
    };
}

export function updateStatus(status: Tweet): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.UpdateStatus,
            next_timeline: getState().timeline.updateStatus(status),
        });
    };
}

export function statusLiked(status: Tweet, from: TwitterUser): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.StatusLiked,
            next_timeline: getState().timeline.updateActivity('liked', status, from),
        });
    };
}

export function setCurrentUser(user: TwitterUser): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.SetCurrentUser,
            next_timeline: getState().timeline.setUser(user),
        });
    };
}

export function updateCurrentUser(user_json: Twitter.User): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.UpdateCurrentUser,
            next_timeline: getState().timeline.updateUser(user_json),
        });
    };
}

export function deleteStatusInTimeline(tweet_id: string): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.DeleteStatusInTimeline,
            next_timeline: getState().timeline.deleteStatusWithId(tweet_id),
        });
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

export function changeCurrentTimeline(kind: TimelineKind): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.ChangeCurrentTimeline,
            next_timeline: getState().timeline.switchTimeline(kind),
        });
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

export function focusOnItem(index: number): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusOnItem,
            next_timeline: getState().timeline.focusOn(index),
        });
    };
}

export function unfocusItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.UnfocusItem,
            next_timeline: getState().timeline.focusOn(null),
        });
    };
}

export function focusNextItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusNextItem,
            next_timeline: getState().timeline.focusNext(),
        });
    };
}

export function focusPrevItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusPrevItem,
            next_timeline: getState().timeline.focusPrevious(),
        });
    };
}

export function focusTopItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusTopItem,
            next_timeline: getState().timeline.focusTop(),
        });
    };
}

export function focusBottomItem(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.FocusBottomItem,
            next_timeline: getState().timeline.focusBottom(),
        });
    };
}

export function addFriends(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddFriends,
            next_timeline: getState().timeline.addFriends(ids),
        });
    };
}

export function removeFriends(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.RemoveFriends,
            next_timeline: getState().timeline.removeFriends(ids),
        });
    };
}

export function resetFriends(ids: number[]): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.ResetFriends,
            next_timeline: getState().timeline.resetFriends(ids),
        });
    };
}

export function openUserTimeline(user: TwitterUser) {
    return {
        type: Kind.OpenUserTimeline,
        user,
    };
}

export function openConversationTimeline(statuses: Tweet[]) {
    return {
        type: Kind.OpenConversationTimeline,
        statuses,
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

export function appendPastItems(user_id: number, items: Item[]) {
    return {
        type: Kind.AppendPastItems,
        user_id,
        items,
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

