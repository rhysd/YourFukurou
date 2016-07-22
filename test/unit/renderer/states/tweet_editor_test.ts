import '../../helper';
import test from 'ava';
import {DefaultTweetEditorState} from '../../../../renderer/states/tweet_editor';

test('By default editor is empty and closed', t => {
    t.false(DefaultTweetEditorState.is_open);
    t.is(DefaultTweetEditorState.core.getCurrentContent().getPlainText(), '');
});
