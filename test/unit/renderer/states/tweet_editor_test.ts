import {fixture} from '../../helper';
import test from 'ava';
import {DefaultTweetEditorState} from '../../../../renderer/states/tweet_editor';

test('By default editor is empty and closed', t => {
    t.false(DefaultTweetEditorState.is_open);
    t.is(DefaultTweetEditorState.core.getCurrentContent().getPlainText(), '');
});

test('openEditor() opens editor with text',  t => {
    const s = DefaultTweetEditorState.openEditor();
    t.true(s.is_open);
    t.is(s.core.getCurrentContent().getPlainText(), '');

    const s2 = DefaultTweetEditorState.openEditor('This is test');
    t.true(s2.is_open);
    t.is(s2.core.getCurrentContent().getPlainText(), 'This is test');
});

test('closeEditor() closes editor and clears content', t => {
    const s = DefaultTweetEditorState
            .openEditor('This is test')
            .closeEditor();

    t.false(s.is_open);
    t.is(s.core.getCurrentContent().getPlainText(), '');
});

test('clearEditor() sets empty text to editor', t => {
    const s = DefaultTweetEditorState
            .openEditor('This is test')
            .clearEditor();
    t.true(s.is_open);
    t.is(s.core.getCurrentContent().getPlainText(), '');

    const u = fixture.user();
    const tw = fixture.tweet_other();
    const s2 = DefaultTweetEditorState
            .openEditorWithInReplyTo(tw, u)
            .clearEditor();
    t.is(s2.in_reply_to_status, null);
});

test('openEditorWithInReplyTo() sets screen names for reply', t => {
    const u = fixture.user();
    const tw = fixture.tweet_other();

    const s = DefaultTweetEditorState.openEditorWithInReplyTo(tw, u);
    t.true(s.is_open);
    t.is(s.core.getCurrentContent().getPlainText(), `@${tw.user.screen_name} `);
    t.is(s.in_reply_to_status, tw.getMainStatus());

    const rp = fixture.reply_from_other_to_others();
    const s2 = DefaultTweetEditorState.openEditorWithInReplyTo(rp, u);
    const text = `@${rp.user.screen_name} ` + rp.json.entities.user_mentions.map(e => `@${e.screen_name} `).join('');
    t.is(s2.core.getCurrentContent().getPlainText(), text);
    t.is(s2.in_reply_to_status, rp.getMainStatus());
});

test('openEditorWithInReplyTo() does not set owner\'s screen name', t => {
    const u = fixture.user();
    const rp = fixture.in_reply_to();
    const rp2 = fixture.in_reply_to_from_other();
    const rp3 = fixture.reply_myself();

    // Precondition
    t.is(u.screen_name, rp.user.screen_name);
    t.is(u.screen_name, rp2.json.in_reply_to_screen_name);
    t.is(u.screen_name, rp3.user.screen_name);
    t.is(u.screen_name, rp3.json.in_reply_to_screen_name);

    const s = DefaultTweetEditorState.openEditorWithInReplyTo(rp, u);
    t.is(s.core.getCurrentContent().getPlainText(), `@${rp.json.in_reply_to_screen_name} `);

    const s2 = DefaultTweetEditorState.openEditorWithInReplyTo(rp2, u);
    t.is(s2.core.getCurrentContent().getPlainText(), `@${rp2.user.screen_name} `);

    const s3 = DefaultTweetEditorState.openEditorWithInReplyTo(rp3, u);
    t.is(s3.core.getCurrentContent().getPlainText(), '');
});

test('onSelect() replace query string with selected text', t => {
    const testcases = [
        ['Test @foo', '@foo', '@foobar', 'Test @foobar'],
        ['#foo', '#foo', '#foobar', '#foobar'],
        [':', ':', ':dog:', ':dog:'],
    ];

    for (const [before, query, text, after] of testcases) {
        const s = DefaultTweetEditorState.openEditor(before);
        const selected = s.onSelect(query, text);
        t.is(selected.core.getCurrentContent().getPlainText(), after);
    }
});
