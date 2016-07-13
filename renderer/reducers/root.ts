import {combineReducers} from 'redux';
import timeline from './timeline';
import editor from './editor';
import editorCompletion from './editor_completion';
import message from './message';
import tweetMedia from './tweet_media';
import slaveTimeline from './slave_timeline';
import State from '../states/root';

const root = combineReducers<State>({
    timeline,
    editor,
    editorCompletion,
    message,
    tweetMedia,
    slaveTimeline,
});
export default root;
