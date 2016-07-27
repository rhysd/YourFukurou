import {fixture} from '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import * as ReactList from 'react-list';
import Lightbox from 'react-images';
import Item from '../../../../renderer/item/item';
import {Timeline} from '../../../../renderer/components/timeline';

function doNothing(_: any) {
    // do nothing;
}

// XXX:
// Importing states/tweet_media.ts occurs an error in reducers/tweet_media.ts
// Error reports the state which tweetMedia() receives is undefined.
function renderTimeline(dispatch: (a: any) => void = doNothing) {
    return shallow(
        <Timeline
            kind="home"
            items={List<Item>([fixture.tweet()])}
            owner={fixture.user()}
            media={{is_open: false} as any}
            focus_index={null}
            friends={List<number>()}
            dispatch={dispatch}
        />
    );
}

test('render infinite list with <ReactList/>', t => {
    const c = renderTimeline();
    const l = c.find(ReactList);
    t.is(l.length, 1);
    t.is(l.props().length, 1);
});

test('put Lightbox', t => {
    const c = renderTimeline();
    t.is(c.find(Lightbox).length, 1);
});
