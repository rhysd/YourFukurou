import Kind from '../action_kinds';
import {Action} from '../actions';
import TweetEditorState, {DefaultTweetEditorState} from '../states/tweet_editor';

export default function editor(state: TweetEditorState = DefaultTweetEditorState, action: Action) {
    switch (action.type) {
        case Kind.ChangeEditorState:            return state.onDraftEditorChange(action.editor!);
        case Kind.SelectAutoCompleteSuggestion: return state.onSelect(action.query!, action.text!);
        case Kind.OpenEditor:                   return state.openEditor(action.text!);
        case Kind.OpenEditorForReply:           return state.openEditorWithInReplyTo(action.status!, action.user!, action.text!);
        case Kind.CloseEditor:                  return state.closeEditor();
        case Kind.ToggleEditor:                 return state.toggleEditor();
        default:                                return state;
    }
}

