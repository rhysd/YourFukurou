import * as React from 'react';
import {connect} from 'react-redux';
import {Editor, EditorState} from 'draft-js';
import {saveAndCloseEditor} from '../../actions';
import IconButton from '../icon_button';

interface TweetFormProps extends React.Props<TweetForm> {
    editor: EditorState;
    dispatch?: Redux.Dispatch;
}

interface TweetFormState {
    editor: EditorState;
}

// XXX:
// We use component local state because when global state holding
// an editor state and dispatching an action on every onChange callback,
// editor update is a little slow and it breaks Japanese composition
// in my local environment.
//
// TODO:
// We need to use CSSTransitionGroup to add open/close animation
//   https://facebook.github.io/react/docs/animation.html
class TweetForm extends React.Component<TweetFormProps, TweetFormState> {
    onChange: (e: EditorState) => void;
    focus: () => void;
    refs: {
        node: HTMLElement;
        editor: HTMLElement;
        [s: string]: React.Component<any, any> | Element;
    };

    constructor(props: TweetFormProps) {
        super(props);
        this.state = {editor: props.editor};
        this.onChange = editor => this.setState({editor});
        this.focus = () => this.refs.editor.focus();
    }

    close() {
        this.refs.node.addEventListener('animationend', () => {
            this.props.dispatch(saveAndCloseEditor(this.state.editor));
        });
        this.refs.node.className = 'tweet-form animated fadeOutUp';
    }

    componentDidMount() {
        this.focus();
    }

    render() {
        return <div className="tweet-form animated fadeInDown" ref="node">
            <IconButton
                className="tweet-form__cancel-btn"
                name="times"
                tip="cancel"
                onClick={() => this.close()}
            />
            <div className="tweet-form__input" onClick={this.focus}>
                <Editor
                    editorState={this.state.editor}
                    onChange={this.onChange}
                    ref="editor"
                />
            </div>
        </div>;
    }
}

export default connect()(TweetForm);
