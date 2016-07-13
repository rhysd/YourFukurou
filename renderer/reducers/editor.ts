import Action from '../action_type';
import TweetEditorState, {DefaultTweetEditorState} from '../states/tweet_editor';

export default function editor(state: TweetEditorState = DefaultTweetEditorState, action: Action) {
    switch (action.type) {
        case 'ChangeEditorState':            return state.onDraftEditorChange(action.editor);
        case 'SelectAutoCompleteSuggestion': return state.onSelect(action.query, action.text);
        case 'OpenEditor':                   return state.openEditor(action.text);
        case 'OpenEditorForReply':           return state.openEditorWithInReplyTo(action.status, action.user, action.text);
        case 'CloseEditor':                  return state.closeEditor();
        case 'ToggleEditor':                 return state.toggleEditor();
        default:                             return state;
    }
}

