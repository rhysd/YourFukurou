import {EditorState} from 'draft-js';
import {Twitter} from 'twit';
import Tweet, {TwitterUser} from './item/tweet';
import Item from './item/item';
import {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import {MessageKind} from './reducers/message';
import {searchSuggestionItems, SuggestionItem} from './components/editor/suggestions';
import log from './log';
import State from './states/root';

import TimelineState, {TimelineKind} from './states/timeline';
import TweetMediaState from './states/tweet_media';
import TweetEditorState from './states/tweet_editor';
import EditorCompletionState from './states/editor_completion';
import SlaveTimeline, {UserTimeline, ConversationTimeline} from './states/slave_timeline';

export const Kind = {
    AddSeparator: Symbol('add-separator'),
    ChangeCurrentTimeline: Symbol('change-current-timeline'),

    NewMessage: Symbol('new-message'),
    DismissMessage: Symbol('dismiss-message'),

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
    message_kind?: MessageKind;
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
    next_timeline?: TimelineState;
    next_media?: TweetMediaState;
    next_editor?: TweetEditorState;
    next_completion?: EditorCompletionState;
    next_slave?: SlaveTimeline;
}

type ThunkAction = (dispatch: Redux.Dispatch, getState: () => State) => void;

export function showMessage(text: string, message_kind: MessageKind) {
    return {
        type: Kind.NewMessage,
        text,
        message_kind,
    };
}

export function dismissMessage() {
    return {
        type: Kind.DismissMessage,
    };
}

export function notImplementedYet() {
    return {
        type: Kind.NewMessage,
        text: 'Sorry, this feature is not implemented yet.',
        message_kind: 'error',
    };
}

export function addSeparator(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.AddSeparator,
        });
    };
}

export function changeEditorState(editor: EditorState): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.ChangeEditorState,
            next_editor: getState().editor.onDraftEditorChange(editor),
        });
    };
}

export function openEditor(text?: string): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.OpenEditor,
            next_editor: getState().editor.openEditor(text),
        });
    };
}

export function openEditorForReply(in_reply_to: Tweet, owner: TwitterUser, text?: string): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.OpenEditorForReply,
            next_editor: getState().editor.openEditorWithInReplyTo(in_reply_to, owner, text),
        });
    };
}

export function closeEditor(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.CloseEditor,
            next_editor: getState().editor.closeEditor(),
        });
    };
}

export function toggleEditor(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.ToggleEditor,
            next_editor: getState().editor.toggleEditor(),
        });
    };
}

export function selectAutoCompleteSuggestion(text: string, query: string): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.SelectAutoCompleteSuggestion,
            next_editor: getState().editor.onSelect(query, text),
        });
    };
}

export function updateAutoCompletion(left: number, top: number, query: string, label: AutoCompleteLabel): ThunkAction {
    return (dispatch, getState) => {
        searchSuggestionItems(query, label)
            .then(suggestions => dispatch({
                type: Kind.UpdateAutoCompletion,
                next_completion: getState().editorCompletion.searchSuggestions(suggestions, query, top, left, label),
            }))
            .catch((e: Error) => log.error('Error on updateAutoCompletion():', e));
    };
}

export function stopAutoCompletion() {
    return {
        type: Kind.StopAutoCompletion,
    };
}

export function downAutoCompletionFocus(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.DownAutoCompletionFocus,
            next_completion: getState().editorCompletion.downFocus(),
        });
    };
}

export function upAutoCompletionFocus(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.UpAutoCompletionFocus,
            next_completion: getState().editorCompletion.upFocus(),
        });
    };
}

export function openPicturePreview(media_urls: string[], index?: number): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.OpenPicturePreview,
            next_media: getState().tweetMedia.openMedia(media_urls, index),
        });
    };
}

export function closeTweetMedia(): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.CloseTweetMedia,
            next_media: getState().tweetMedia.closeMedia(),
        });
    };
}

export function moveToNthPicturePreview(index: number): ThunkAction {
    return (dispatch, getState) => {
        dispatch({
            type: Kind.MoveToNthPicturePreview,
            next_media: getState().tweetMedia.moveToNthMedia(index),
        });
    };
}

export function openUserTimeline(user: TwitterUser) {
    return {
        type: Kind.OpenUserTimeline,
        next_slave: new UserTimeline(user),
    };
}

export function openConversationTimeline(statuses: Tweet[]) {
    return {
        type: Kind.OpenConversationTimeline,
        next_slave: ConversationTimeline.fromArray(statuses),
    };
}

export function closeSlaveTimeline(): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave === null) {
            return;
        }
        dispatch({
            type: Kind.CloseSlaveTimeline,
            next_slave: slave.close(),
        });
    };
}

export function addUserTweets(user_id: number, statuses: Tweet[]): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave instanceof UserTimeline && slave.user.id === user_id) {
            dispatch({
                type: Kind.AddUserTweets,
                next_slave: slave.addTweets(statuses),
            });
        }
    };
}

export function appendPastItems(user_id: number, items: Item[]): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave instanceof UserTimeline && slave.user.id === user_id) {
            dispatch({
                type: Kind.AppendPastItems,
                next_slave: slave.appendPastItems(items),
            });
        }
    };
}

export function focusSlaveNext(): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave === null) {
            return;
        }
        dispatch({
            type: Kind.FocusSlaveNext,
            next_slave: slave.focusNext(),
        });
    };
}

export function focusSlavePrev(): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave === null) {
            return;
        }
        dispatch({
            type: Kind.FocusSlavePrev,
            next_slave: slave.focusPrev(),
        });
    };
}

export function focusSlaveTop(): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave === null) {
            return;
        }
        dispatch({
            type: Kind.FocusSlaveTop,
            next_slave: slave.focusTop(),
        });
    };
}

export function focusSlaveBottom(): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave === null) {
            return;
        }
        dispatch({
            type: Kind.FocusSlaveBottom,
            next_slave: slave.focusBottom(),
        });
    };
}

export function focusSlaveOn(index: number): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave === null) {
            return;
        }
        dispatch({
            type: Kind.FocusSlaveOn,
            next_slave: slave.focusOn(index),
        });
    };
}

export function blurSlaveTimeline(): ThunkAction {
    return (dispatch, getState) => {
        const slave = getState().slaveTimeline;
        if (slave === null) {
            return;
        }
        dispatch({
            type: Kind.BlurSlaveTimeline,
            next_slave: slave.blur(),
        });
    };
}

