import * as React from 'react';
import {connect} from 'react-redux';
import {Editor, EditorState} from 'draft-js';
import {changeEditorState} from '../../actions';

interface TweetFormProps extends React.Props<any> {
    editor: EditorState;
    dispatch?: Redux.Dispatch;
}

// TODO:
// I used class style component because of closing animation.
//   1. Add 'animate fadeOutXxx' to class name
//   2. Dispatch tweet action on 'animationend' event
class TweetForm extends React.Component<TweetFormProps, {}> {
    render() {
        return <div className="tweet-form animated fadeInDown">
            <div className="tweet-form__input">
                <Editor
                    editorState={this.props.editor}
                    onChange={editor => this.props.dispatch(changeEditorState(editor))}
                />
            </div>
        </div>;
    }
}

export default connect()(TweetForm);

