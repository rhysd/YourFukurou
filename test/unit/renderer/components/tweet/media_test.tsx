import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import {TweetMedia} from '../../../../../renderer/components/tweet/media';
import {Action} from '../../../../../renderer/actions';
import Kind from '../../../../../renderer/action_kinds';

function doNothing() {
    // Do nothing
}

test('shows picture media in <img>', t => {
    const tw = fixture.media();
    const media = tw.media;
    const c = shallow(
        <TweetMedia entities={media} dispatch={doNothing}/>
    );
    const imgs = c.find('img');
    t.is(imgs.length, media.length);
    t.true(imgs.at(0).props().src.indexOf(media[0].media_url) !== -1);
    t.is(imgs.at(0).props().alt, media[0].display_url);
});

test('clicking picture dispatches corresponding action', t => {
    const tw = fixture.media();
    const media = tw.media;
    const cb = spy();
    const c = shallow(
        <TweetMedia entities={media} dispatch={cb}/>
    );
    const e = {
        stopPropagation() {
            // Do nothing
        },
    };
    c.find('.tweet__media-wrapper').at(0).simulate('click', e);
    t.true(cb.called);
    const action = cb.args[0][0] as Action;
    t.is(action.type, Kind.OpenPicturePreview);
    t.is(action.media_urls[0], media[0].media_url);
    t.is(action.index, 0);
});

