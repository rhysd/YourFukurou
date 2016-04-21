import * as React from 'react';
import {connect} from 'react-redux';
import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js';
import {
    changeEditorState,
    changeEditorVisibility,
    showMessage,
    updateStatus,
} from '../../actions';
import IconButton from '../icon_button';
import EditorKeybinds from '../../keybinds/editor';
import log from '../../log';

interface TweetFormProps extends React.Props<any> {
    editor: EditorState;
    keybinds: EditorKeybinds;
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
    keyBindingHandler: (e: React.KeyboardEvent) => string;
    keyCommandHandler: (cmd: string) => boolean;
    returnHandler: (e: React.KeyboardEvent) => boolean;

    constructor(props: TweetFormProps) {
        super(props);
        this.keyBindingHandler = e => {
            // Note: When RETURN key is pressed
            if (e.keyCode === 10 || e.keyCode === 13) {
                // XXX:
                // When 'handleReturn' prop is specified, this keybinding
                // handler is also executed.  But the keyCommandHandler
                // is never executed.
                // So we need to handle an action for RETURN key in
                // returnHandler and this handler doesn't need to handle
                // the event (it is handled by returnHandler).
                return getDefaultKeyBinding(e);
            }

            const action = this.props.keybinds.resolveEvent(e);
            if (action !== null) {
                log.debug('Handling original keymap:', action);
                return action;
            }

            log.debug('Not handled:', e);
            return getDefaultKeyBinding(e);
        };
        this.keyCommandHandler =
            cmd => this.props.keybinds.handleAction(cmd);
        this.returnHandler =
            e => {
                const a = this.props.keybinds.resolveReturnAction(e);
                switch (a) {
                    case 'send-tweet': {
                        this.sendTweet();
                        return true;
                    }
                    default:
                        return false;
                }
            };
    }

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

    sendTweet() {
        const content = this.props.editor.getCurrentContent();
        if (content.hasText()) {
            this.props.dispatch(
                updateStatus(content.getPlainText())
            );
            this.close();
        }
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
                    handleKeyCommand={this.keyCommandHandler}
                    handleReturn={this.returnHandler}
                    keyBindingFn={this.keyBindingHandler}
                    onEscape={() => this.close()}
                    onChange={e => this.props.dispatch(changeEditorState(e))}
                    ref="editor"
                />
            </div>
            <div className="tweet-form__send-btn">
                <IconButton
                    name="twitter"
                    tip="send tweet"
                    onClick={() => this.sendTweet()}
                />
            </div>
        </div>;
    }
}

export default connect()(TweetForm);

