import * as React from 'react';
import {connect} from 'react-redux';
import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js';
import {getTweetLength} from 'twitter-text';
import {
    changeEditorState,
    closeEditor,
    showMessage,
    updateStatus,
    downAutoCompletionFocus,
    upAutoCompletionFocus,
    selectAutoCompleteSuggestion,
} from '../../actions';
import IconButton from '../icon_button';
import EditorKeybinds from '../../keybinds/editor';
import Tweet from '../../item/tweet';
import log from '../../log';
import State from '../../reducers/state';
import {EditorCompletionState} from '../../reducers/editor_completion';
import AutoCompleteSuggestions, {SuggestionItem} from './suggestions';
import {AutoCompleteLabel} from './auto_complete_decorator';
import TweetPrimary from '../tweet/primary';
import TweetSecondary from '../tweet/secondary';
import TweetIcon from '../tweet/icon';

interface TweetEditorProps extends React.Props<any> {
    editor: EditorState;
    keybinds: EditorKeybinds;
    inReplyTo: Tweet;
    completion: EditorCompletionState,
    dispatch?: Redux.Dispatch;
}

function notImplementedYet(props: TweetEditorProps) {
    'use strict';
    props.dispatch(showMessage('Sorry, this feature is not implemented yet.', 'error'));
}

// TODO:
// We need to use CSSTransitionGroup to add open/close animation
//   https://facebook.github.io/react/docs/animation.html
class TweetEditor extends React.Component<TweetEditorProps, {}> {
    keyBindingHandler: (e: React.KeyboardEvent) => string;
    keyCommandHandler: (cmd: string) => boolean;
    returnHandler: (e: React.KeyboardEvent) => boolean;
    blurHandler: (e: React.SyntheticEvent) => void;
    tabHandler: (e: React.KeyboardEvent) => void;

    constructor(props: TweetEditorProps) {
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

            log.debug('Not handled:', e.keyCode);
            return getDefaultKeyBinding(e);
        };
        this.keyCommandHandler =
            cmd => this.props.keybinds.handleAction(cmd);
        this.returnHandler =
            e => {
                const a = this.props.keybinds.resolveReturnAction(e);
                log.debug('Handling return key:', a);
                switch (a) {
                    case 'send-tweet': {
                        this.sendTweet();
                        return true;
                    }
                    case 'choose-suggestion': {
                        return this.selectAutoCompletionItem();
                    }
                    default:
                        return false;
                }
            };
        this.blurHandler = e => {
            e.preventDefault();
            this.refs.editor.focus();
        };
        this.tabHandler =
            e => {
                e.preventDefault();
                const action = this.props.keybinds.resolveEvent(e);
                if (action === null) {
                    return false;
                }
                log.debug('Handling tab key:', action);
                this.props.keybinds.handleAction(action);
                return true;
            };
    }

    refs: {
        body: HTMLElement;
        editor: HTMLElement;
        [s: string]: React.Component<any, any> | Element;
    }

    close() {
        this.refs.body.addEventListener('animationend', () => {
            this.props.dispatch(closeEditor());
        });
        this.refs.body.className = 'tweet-form animated fadeOutUp';
    }

    selectAutoCompletionItem() {
        const completion = this.props.completion;
        if (completion.focus_idx === null) {
            return false;
        }
        const s = completion.suggestions[completion.focus_idx];
        if (!s) {
            return false;
        }
        this.props.dispatch(
            selectAutoCompleteSuggestion(s.code, completion.query)
        );
        return true;
    }

    sendTweet() {
        const content = this.props.editor.getCurrentContent();
        if (content.hasText()) {
            const irt = this.props.inReplyTo ? this.props.inReplyTo.getMainStatus().id : null;
            this.props.dispatch(updateStatus(content.getPlainText(), irt));
            this.close();
        }
    }

    componentDidMount() {
        this.refs.editor.focus();
    }

    renderInReplyTo() {
        if (!this.props.inReplyTo) {
            return undefined;
        }
        const tw = this.props.inReplyTo.getMainStatus();
        return <div className="tweet-form__in-reply-to">
            <TweetIcon user={tw.user}/>
            <TweetSecondary status={this.props.inReplyTo}/>
            <TweetPrimary status={this.props.inReplyTo}/>
        </div>;
    }

    render() {
        const completion = this.props.completion;
        const has_text = this.props.editor.getCurrentContent().hasText();
        const btn_state = has_text ? 'active' : 'inactive';

        const char_count = getTweetLength(this.props.editor.getCurrentContent().getPlainText());
        const count_state = char_count > 140 ? 'over' : 'normal';

        const suggestions =
                completion.label === null ?
                    undefined :
                    <AutoCompleteSuggestions {...completion}/>;

        return <div className="tweet-form animated fadeInDown" ref="body">
            {this.renderInReplyTo()}
            <div className="tweet-form__editor">
                <IconButton
                    className="tweet-form__cancel-btn"
                    name="times"
                    tip="cancel"
                    onClick={() => this.close()}
                />
                <div className="tweet-form__input">
                    <Editor
                        editorState={this.props.editor}
                        placeholder="Tweet..."
                        handleKeyCommand={this.keyCommandHandler}
                        handleReturn={this.returnHandler}
                        keyBindingFn={this.keyBindingHandler}
                        onEscape={() => this.close()}
                        onTab={this.tabHandler}
                        onBlur={this.blurHandler}
                        onChange={e => this.props.dispatch(changeEditorState(e))}
                        ref="editor"
                    />
                    <div className={'tweet-form__counter tweet-form__counter_' + count_state}>
                        {char_count}
                    </div>
                </div>
                <div className={'tweet-form__send-btn tweet-form__send-btn_' + btn_state}>
                    <IconButton
                        name="twitter"
                        tip="send tweet"
                        onClick={() => this.sendTweet()}
                    />
                </div>
                {suggestions}
            </div>
        </div>;
    }
}

function select(state: State): TweetEditorProps {
    return {
        editor: state.editor.core,
        keybinds: state.editor.keymaps,
        inReplyTo: state.editor.in_reply_to_status,
        completion: state.editorCompletion,
    };
}

export default connect(select)(TweetEditor);

