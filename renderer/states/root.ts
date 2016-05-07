import TimelineState from './timeline';
import TweetEditorState from './tweet_editor';
import EditorCompletionState from './editor_completion';
import {MessageState} from '../reducers/message';
import {TweetMediaState} from '../reducers/tweet_media';

type State = {
    timeline: TimelineState,
    editor: TweetEditorState,
    editorCompletion: EditorCompletionState,
    message: MessageState,
    tweetMedia: TweetMediaState,
}
export default State;

