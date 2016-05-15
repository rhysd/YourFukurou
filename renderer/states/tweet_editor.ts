import {EditorState, Modifier, CompositeDecorator, SelectionState, ContentState} from 'draft-js';
import Tweet, {TwitterUser} from '../item/tweet';
import EditorKeymaps from '../keybinds/editor';
import autoCompleteFactory from '../components/editor/auto_complete_decorator';
import log from '../log';

// Note:
// These are currently created statically.  But actually they should be created dynamically
// with the state of reducer.
const editorDecolator = new CompositeDecorator([
    autoCompleteFactory(/:[a-zA-Z0-9_\-\+]+:?/g, 'EMOJI'),
    autoCompleteFactory(/@\w*\s?/g, 'SCREENNAME'),
    autoCompleteFactory(/#\S*\s?/g, 'HASHTAG'),
]);

export default class TweetEditorState {
    constructor(
        public core: EditorState,
        public is_open: boolean,
        public keymaps: EditorKeymaps,
        public in_reply_to_status: Tweet
    ) {}

    onDraftEditorChange(new_core: EditorState) {
        return new TweetEditorState(
            new_core,
            this.is_open,
            this.keymaps,
            this.in_reply_to_status
        );
    }

    clearEditor() {
        return new TweetEditorState(
            EditorState.createEmpty(editorDecolator),
            this.is_open,
            this.keymaps,
            null
        );
    }

    onSelect(query: string, text: string) {
        const selection = this.core.getSelection();
        const offset = selection.getAnchorOffset() - 1;
        const content = this.core.getCurrentContent();
        const block_text = content.getBlockForKey(selection.getAnchorKey()).getText();
        const idx = block_text.lastIndexOf(query, offset);

        if (idx === -1 || (idx + query.length < offset)) {
            log.error('Invalid selection:', selection);
            return this;
        }

        const next_selection = selection.merge({
            anchorOffset: idx,
            focusOffset: idx + query.length,
        }) as SelectionState;
        const next_content = Modifier.replaceText(content, next_selection, text);
        const next_editor = EditorState.forceSelection(
            EditorState.push(
                this.core,
                next_content,
                'insert-characters'
            ),
            next_content.getSelectionAfter()
        );

        return new TweetEditorState(
            next_editor,
            this.is_open,
            this.keymaps,
            this.in_reply_to_status
        );
    }

    setTextToEditor(text: string) {
        return EditorState.moveSelectionToEnd(
            EditorState.push(
                this.core,
                ContentState.createFromText(text),
                'insert-characters'
            )
        );
    }

    setReplyText(in_reply_to: Tweet, owner: TwitterUser) {
        // Note:
        // When in-reply-to user is me, no need to show @reply
        // screen name explicitly.
        const reply_to_me = in_reply_to.user.id === owner.id;
        let text = reply_to_me ? '' : `@${in_reply_to.user.screen_name} `;

        // Note:
        // Add all mentioned users to default text of reply tweet.
        // TODO:
        // Should all users except for in-reply-to user be selected by default
        // to make it easy to remove them from editing text?
        if (in_reply_to.mentions.length > 0) {
            text +=
                in_reply_to.mentions
                    .filter(m => m.id !== owner.id)
                    .map(m => `@${m.screen_name} `).join('');
        }

        if (text === '') {
            return this.core;
        } else {
            return this.setTextToEditor(text);
        }
    }

    openEditorWithInReplyTo(status: Tweet, owner: TwitterUser) {
        const in_reply_to = status.getMainStatus();
        const next_core = this.setReplyText(in_reply_to, owner);
        return new TweetEditorState(
            next_core,
            true,
            this.keymaps,
            in_reply_to
        );
    }

    openEditor() {
        return new TweetEditorState(
            this.core,
            true,
            this.keymaps,
            null
        );
    }

    closeEditor() {
        return new TweetEditorState(
            EditorState.push(
                this.core,
                ContentState.createFromText(''),
                'remove-range'
            ),
            false,
            this.keymaps,
            null
        );
    }

    toggleEditor() {
        return this.is_open ?  this.closeEditor() : this.openEditor();
    }
}

export const DefaultTweetEditorState =
    new TweetEditorState(
        EditorState.createEmpty(editorDecolator),
        false,
        new EditorKeymaps(),
        null
    );
