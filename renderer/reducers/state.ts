import TimelineState from '../states/timeline';
import TweetEditorState from '../states/tweet_editor';
import {EditorCompletionState} from './editor_completion';
import {MessageState} from './message';

type State = {
    timeline: TimelineState,
    editor: TweetEditorState,
    editorCompletion: EditorCompletionState,
    message: MessageState,
}
export default State;

