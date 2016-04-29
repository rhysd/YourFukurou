import {TimelineState} from './timeline';
import {TweetEditorState} from './editor';
import {EditorCompletionState} from './editor_completion';

type State = {
    timeline: TimelineState,
    editor: TweetEditorState,
    editorCompletion: EditorCompletionState,
}
export default State;

