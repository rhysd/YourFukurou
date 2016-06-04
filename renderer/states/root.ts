import TimelineState from './timeline';
import TweetEditorState from './tweet_editor';
import EditorCompletionState from './editor_completion';
import TweetMediaState from './tweet_media';
import {MessageState} from '../reducers/message';
import SlaveTimeline from './slave_timeline';

type State = {
    timeline: TimelineState,
    editor: TweetEditorState,
    editorCompletion: EditorCompletionState,
    message: MessageState,
    tweetMedia: TweetMediaState,
    slaveTimeline: SlaveTimeline,
}
export default State;

