import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import {ScreenName} from '../../../../../renderer/components/tweet/screen_name';

function doNothing() {
    // Do nothing
}

test('show screen name', t => {
    const user = fixture.user();
    const sn = '@' + user.screen_name;
    const c = shallow(<ScreenName user={user} onClick={doNothing}/>);
    t.true(c.text().indexOf(sn) !== -1);
    const l = c.find('.external-link');
    t.is(l.length, 1);
    t.is(l.props().title, sn);
});

test('show lock icon for protected user', t => {
    const user = fixture.user();
    user.json.protected = true;
    const c = shallow(<ScreenName user={user} onClick={doNothing}/>);
    t.true(c.find('.fa.fa-lock').length > 0);
});

test('fires onClick', t => {
    const cb = spy();
    const c = shallow(<ScreenName user={fixture.user()} onClick={cb}/>);
    c.find('.external-link').simulate('click');
    t.true(cb.called);
});

test('can pass className', t => {
    const c = shallow(<ScreenName user={fixture.user()} onClick={doNothing} className="my-class-name"/>);
    t.true(c.find('.my-class-name').length > 0);
});
