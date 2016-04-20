import * as React from 'react';
import {connect} from 'react-redux';
import {Editor, EditorState} from 'draft-js';
import {changeEditorState, changeEditorVisibility} from '../../actions';
import IconButton from '../icon_button';

interface TweetFormProps extends React.Props<any> {
    editor: EditorState;
    dispatch?: Redux.Dispatch;
}

// TODO:
// We need to use CSSTransitionGroup to add open/close animation
//   https://facebook.github.io/react/docs/animation.html
class TweetForm extends React.Component<TweetFormProps, {}> {
    node: HTMLElement;

    close() {
        this.node.addEventListener('animationend', () => {
            this.props.dispatch(changeEditorVisibility(false));
        });
        this.node.className = 'tweet-form animated fadeOutUp';
    }

    render() {
        return <div className="tweet-form animated fadeInDown" ref={r => { this.node = r; }}>
            <IconButton
                className="tweet-form__cancel-btn"
                name="times"
                tip="cancel"
                onClick={() => this.close()}
            />
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

