import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import MiniTweetIcon from '../../../../../renderer/components/mini_tweet/icon';

test('show icon with proper size', t => {
    const u = fixture.user();
    const c = shallow(
        <MiniTweetIcon user={u} quoted={false}/>
    );
    const img = c.find('img');
    t.true(img.length > 0);

    t.is(img.props().width, 48);
    t.is(img.props().alt, '@' + u.screen_name);
});

test('consider quoted status', t => {
    const c = shallow(
        <MiniTweetIcon user={fixture.user()} quoted/>
    );
    const e = c.find('.mini-tweet__icon-image_2cols');
    t.true(e.length > 0);
});
