import {EditorState, Modifier, CompositeDecorator, SelectionState, ContentState} from 'draft-js';
import Tweet from '../item/tweet';
import EditorKeymaps from '../keybinds/editor';
import autoCompleteFactory from '../components/editor/auto_complete_decorator';
import createHashtagDecorator from '../components/editor/hashtag_decorator';
import log from '../log';

// Note:
// These are currently created statically.  But actually they should be created dynamically
// with the state of reducer.
const editorDecolator = new CompositeDecorator([
    createHashtagDecorator(),     // XXX: Temporary
    autoCompleteFactory(/:[a-zA-Z0-9_\-\+]+:?/g, 'EMOJI'),
    autoCompleteFactory(/@\w*\s?/g, 'SCREENNAME'),
]);

export default class TweetEditorState {
    constructor(
        public core: EditorState = EditorState.createEmpty(editorDecolator),
        public is_open: boolean = false,
        public keymaps: EditorKeymaps = new EditorKeymaps(),
        public in_reply_to_status: Tweet = null
    ) {
    }

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

    openEditor(status: Tweet) {
        const next_core =
            status === null ?
                this.core :
                this.setTextToEditor(`@${status.getMainStatus().user.screen_name} `);

        return new TweetEditorState(
            next_core,
            true,
            this.keymaps,
            status
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

    toggleEditor(status: Tweet) {
        return this.is_open ?
            this.closeEditor() :
            this.openEditor(status);
    }
}
