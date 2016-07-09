import State from '../states/root';
import TimelineState from '../states/timeline';
import TweetMediaState from '../states/tweet_media';
import TweetEditorState from '../states/tweet_editor';
import EditorCompletionState from '../states/editor_completion';
import SlaveTimeline from '../states/slave_timeline';

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

export type ThunkAction = (dispatch: Redux.Dispatch, getState: () => State) => void;

