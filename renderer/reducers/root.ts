import {combineReducers} from 'redux';
import timeline from './timeline';
import editor from './editor';
import editorCompletion from './editor_completion';
import statelessActions from './stateless_actions';
import message from './message';

const root = combineReducers({
    timeline,
    editor,
    editorCompletion,
    statelessActions,
    message,
});
export default root;
