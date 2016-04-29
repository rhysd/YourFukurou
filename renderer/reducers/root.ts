import {combineReducers} from 'redux';
import timeline from './timeline';
import editor from './editor';
import editorCompletion from './editor_completion';
import remoteActions from './remote_actions';
import message from './message';

const root = combineReducers({
    timeline,
    editor,
    editorCompletion,
    message,
    remoteActions,
});
export default root;
