import {EditorState} from 'draft-js';
import {Twitter} from 'twit';
import Item from './item/item';
import Tweet, {TwitterUser} from './item/tweet';
import {AutoCompleteLabel} from './components/editor/auto_complete_decorator';
import {TimelineKind} from './states/timeline';
import {MessageKind} from './reducers/message';
import { SuggestionItem} from './components/editor/suggestions';

type ActionType = {
    type: 'AddSeparator';
} | {
    type: 'ChangeCurrentTimeline';
    timeline: TimelineKind;
} | {
    type: 'ShowMessage';
    text: string;
    msg_kind: MessageKind;
} | {
    type: 'DismissMessage';
} | {
    type: 'NotImplementedYet';
} | {
    type: 'AddTweetToTimeline';
    status: Tweet;
} | {
    type: 'AddTweetsToTimeline';
    statuses: Tweet[];
} | {
    type: 'SetCurrentUser';
    user: TwitterUser;
} | {
    type: 'UpdateCurrentUser';
    user_json: Twitter.User;
} | {
    type: 'DeleteStatusInTimeline';
    tweet_id: string;
} | {
    type: 'AddMentions';
    mentions: Tweet[];
} | {
    type: 'AddRejectedUserIds';
    ids: number[];
} | {
    type: 'RemoveRejectedUserIds';
    ids: number[];
} | {
    type: 'AddNoRetweetUserIds';
    ids: number[];
} | {
    type: 'CompleteMissingStatuses';
    timeline: TimelineKind;
    index: number;
    items: Item[];
} | {
    type: 'RetweetSucceeded';
    status: Tweet;
} | {
    type: 'UnretweetSucceeded';
    status: Tweet;
} | {
    type: 'LikeSucceeded';
    status: Tweet;
} | {
    type: 'UnlikeSucceeded';
    status: Tweet;
} | {
    type: 'StatusLiked';
    user: TwitterUser;
    status: Tweet;
} | {
    type: 'ChangeEditorState';
    editor: EditorState;
} | {
    type: 'OpenEditor';
    text?: string;
} | {
    type: 'OpenEditorForReply';
    status: Tweet;
    user: TwitterUser;
    text?: string;
} | {
    type: 'CloseEditor';
} | {
    type: 'ToggleEditor';
} | {
    type: 'SelectAutoCompleteSuggestion';
    text: string;
    query: string;
} | {
    type: 'UpdateAutoCompletion';
    left: number;
    top: number;
    query: string;
    suggestions: SuggestionItem[];
    completion_label: AutoCompleteLabel;
} | {
    type: 'StopAutoCompletion';
} | {
    type: 'DownAutoCompletionFocus';
} | {
    type: 'UpAutoCompletionFocus';
} | {
    type: 'OpenPicturePreview';
    media_urls: string[];
    index?: number;
} | {
    type: 'CloseTweetMedia';
} | {
    type: 'MoveToNthPicturePreview';
    index: number;
} | {
    type: 'FocusOnItem';
    index: number;
} | {
    type: 'UnfocusItem';
} | {
    type: 'FocusNextItem';
} | {
    type: 'FocusPrevItem';
} | {
    type: 'FocusTopItem';
} | {
    type: 'FocusBottomItem';
} | {
    type: 'AddFriends';
    ids: number[];
} | {
    type: 'RemoveFriends';
    ids: number[];
} | {
    type: 'ResetFriends';
    ids: number[];
} | {
    type: 'OpenUserTimeline';
    user: TwitterUser;
} | {
    type: 'OpenConversationTimeline';
    statuses: Tweet[];
} | {
    type: 'CloseSlaveTimeline';
} | {
    type: 'AddUserTweets';
    user_id: number;
    statuses: Tweet[];
} | {
    type: 'AppendPastItems';
    user_id: number;
    items: Item[];
} | {
    type: 'BlurSlaveTimeline';
} | {
    type: 'FocusSlaveNext';
} | {
    type: 'FocusSlavePrev';
} | {
    type: 'FocusSlaveTop';
} | {
    type: 'FocusSlaveBottom';
} | {
    type: 'FocusSlaveOn';
    index: number;
};

export default ActionType;
