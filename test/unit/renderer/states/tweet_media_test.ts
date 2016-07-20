import '../../helper';
import test from 'ava';
import {DefaultTweetMediaState} from '../../../../renderer/states/tweet_media';

test('By default preview is closed', t => {
    t.false(DefaultTweetMediaState.is_open);
    t.is(DefaultTweetMediaState.picture_urls.length, 0);
});

test('openMedia() sets picture URLs with start index', t => {
    const urls = [
        'http://example.com/pic.jpg',
        'http://example.com/pic2.png',
    ];

    const m1 = DefaultTweetMediaState.openMedia(urls);
    t.deepEqual(m1.picture_urls, urls);
    t.true(m1.is_open);
    t.is(m1.index, 0);

    const m2 = DefaultTweetMediaState.openMedia(urls, 1);
    t.is(m2.index, 1);
});

test('closeMedia() closes preview', t => {
    const urls = [
        'http://example.com/pic.jpg',
    ];
    const urls2 = [
        'http://example.com/pic2.png',
    ];

    const m1 = DefaultTweetMediaState.openMedia(urls, 0);
    const m2 = m1.closeMedia();
    t.false(m2.is_open);
    const m3 = m2.openMedia(urls2, 1);
    t.is(m3.picture_urls[0], urls2[0]);
    t.is(m3.index, 1);
});

test('moveToNthMedia() updates index of current preview', t => {
    const urls = [
        'http://example.com/pic.jpg',
        'http://example.com/pic2.png',
    ];

    const m1 = DefaultTweetMediaState.openMedia(urls, 0);
    const m2 = m1.moveToNthMedia(1);
    t.is(m2.index, 1);
    t.true(m2.is_open);
    t.deepEqual(m2.picture_urls, urls);

    t.is(m2, m2.moveToNthMedia(42));
    t.is(m2, m2.moveToNthMedia(-1));
});
