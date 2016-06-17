import {fixture} from '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import {Icon} from '../../../../renderer/components/icon';

function onClick() {}

test.beforeEach(t => {
    t.context.user = fixture.user();
});

test('shows user icon with tip', t => {
    const w = shallow(
        <Icon user={t.context.user} size={48} onClick={onClick}/>
    );
    const body = w.find('.user-icon');
    t.is(body.length, 1);
    const p = w.props();
    t.is(p.className, 'user-icon');
    t.is(p.title, '@Linda_pp');
});

test('icon size is given', t => {
    const w = shallow(
        <Icon user={t.context.user} size={48} onClick={onClick}/>
    );
    const i = w.find('.user-icon__inner');
    const s = i.props().style;
    t.is(s.width, '48px');
    t.is(s.height, '48px');
});

test('icon propagate onClick callback', t => {
    const cb = spy();
    const w = shallow(
        <Icon user={t.context.user} size={48} onClick={cb}/>
    );
    w.simulate('click');
    t.true(cb.called);
});

test('show empty icon if user is null', t => {
    const w = shallow(
        <Icon user={null} size={48} onClick={onClick}/>
    );
    const p = w.find('.user-icon__inner').props();
    t.is(p.src, '');
    t.is(p.alt, '');
    t.is(p.style.width, '48px');
});

