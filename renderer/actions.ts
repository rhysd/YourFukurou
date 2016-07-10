import {EditorState} from 'draft-js';
import {Twitter} from 'twit';
import Tweet, {TwitterUser} from './item/tweet';
import Item from './item/item';
import {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import State from './states/root';
import TimelineState, {TimelineKind} from './states/timeline';
import {MessageKind} from './reducers/message';
import {searchSuggestionItems, SuggestionItem} from './components/editor/suggestions';
import log from './log';
import notifyTweet from './notification/tweet';
import notifyLiked from './notification/like';

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

    RetweetSucceeded: Symbol('retweet-succeeded'),
    UnretweetSucceeded: Symbol('unretweet-succeeded'),
    LikeSucceeded: Symbol('like-succeeded'),
    UnlikeSucceeded: Symbol('unlike-succeeded'),
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
}

type ThunkAction = (dispatch: Redux.Dispatch, getState: () => State) => void;

export function addTweetToTimeline(status: Tweet): ThunkAction {
    return (dispatch, getState) => {
        const timeline = getState().timeline;
        window.requestIdleCallback(() => {
            dispatch({
                type: Kind.AddTweetToTimeline,
                status,
            });

            const should_add_to = timeline.shouldAddToTimeline(status);
            if (should_add_to.home || should_add_to.mention) {
                notifyTweet(status, timeline.user);
            }
        });
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

export function completeMissingStatuses(timeline: TimelineKind, index: number, items: Item[]) {
    return {
        type: Kind.CompleteMissingStatuses,
        timeline,
        index,
        items,
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

export function statusLiked(status: Tweet, from: TwitterUser): ThunkAction {
    return (dispatch, getState) => {
        const timeline = getState().timeline;
        window.requestIdleCallback(() => {
            dispatch({
                type: Kind.StatusLiked,
                user: from,
                status,
            });

            // Note:
            // We don't check the status is marked as 'rejected' because activities are related to
            // owner's tweet and it must not be rejected.
            if (from.id !== timeline.user.id) {
                notifyLiked(status, from);
            }
        });
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

export function resetFriends(ids: number[]) {
    return {
        type: Kind.ResetFriends,
        ids,
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

