import * as React from 'react';
import {connect} from 'react-redux';
import {Editor, EditorState} from 'draft-js';
import {changeEditorState, changeEditorVisibility, showMessage} from '../../actions';
import IconButton from '../icon_button';

interface TweetFormProps extends React.Props<any> {
    editor: EditorState;
    dispatch?: Redux.Dispatch;
}

function notImplementedYet(props: TweetFormProps) {
    'use strict';
    props.dispatch(showMessage('Sorry, this feature is not implemented yet.', 'error'));
}

// TODO:
// We need to use CSSTransitionGroup to add open/close animation
//   https://facebook.github.io/react/docs/animation.html
class TweetForm extends React.Component<TweetFormProps, {}> {
    refs: {
        body: HTMLElement;
        editor: HTMLElement;
        [s: string]: React.Component<any, any> | Element;
    }

    close() {
        this.refs.body.addEventListener('animationend', () => {
            this.props.dispatch(changeEditorVisibility(false));
        });
        this.refs.body.className = 'tweet-form animated fadeOutUp';
    }

    componentDidMount() {
        this.refs.editor.focus();
    }

    render() {
        return <div className="tweet-form animated fadeInDown" ref="body">
            <IconButton
                className="tweet-form__cancel-btn"
                name="times"
                tip="cancel"
                onClick={() => this.close()}
            />
            <div className="tweet-form__input">
                <Editor
                    editorState={this.props.editor}
                    onChange={e => this.props.dispatch(changeEditorState(e))}
                    ref="editor"
                />
            </div>
            <div className="tweet-form__send-btn">
                <IconButton
                    name="twitter"
                    tip="send tweet"
                    onClick={() => notImplementedYet(this.props)}
                />
            </div>
        </div>;
    }
}

export default connect()(TweetForm);

