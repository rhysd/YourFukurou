import {Action, Kind} from '../actions';
import TweetEditorState, {DefaultTweetEditorState} from '../states/tweet_editor';

export default function editor(state: TweetEditorState = DefaultTweetEditorState, action: Action) {
    switch (action.type) {
        case Kind.ChangeEditorState:            return action.next_editor;
        case Kind.SelectAutoCompleteSuggestion: return action.next_editor;
        case Kind.OpenEditor:                   return action.next_editor;
        case Kind.OpenEditorForReply:           return action.next_editor;
        case Kind.CloseEditor:                  return action.next_editor;
        case Kind.ToggleEditor:                 return action.next_editor;
        default:                                return state;
    }
}

