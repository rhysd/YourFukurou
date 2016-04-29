import TimelineState from './timeline';
import TweetEditorState from './tweet_editor';
import EditorCompletionState from './editor_completion';
import {MessageState} from '../reducers/message';

type State = {
    timeline: TimelineState,
    editor: TweetEditorState,
    editorCompletion: EditorCompletionState,
    message: MessageState,
}
export default State;

