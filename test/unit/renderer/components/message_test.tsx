import '../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import Message from '../../../../renderer/components/message';

function dispatch(a: any) {}

test('show/dismiss message', t => {
    const c = shallow(<Message kind="info" text="This is information message." dispatch={dispatch}/>);
    t.truthy(c.find('.message__body'));
    const m = c.find('.message__text');
    t.truthy(m);
    t.is(m.text(), 'This is information message.');
    t.truthy(c.find('.fa.fa-check'));
    const x = c.find('.message__x-btn');
    t.truthy(x);
});

test('show info message', t => {
    const c = shallow(<Message kind="info" text="This is information message." dispatch={dispatch}/>);
    t.truthy(c.find('.message__body.message__body_info'));
    t.truthy(c.find('.fa.fa-check'));
});

test('show error message', t => {
    const c = shallow(<Message kind="error" text="This is error message." dispatch={dispatch}/>);
    t.truthy(c.find('.message__body.message__body_error'));
    t.truthy(c.find('.fa.fa-exclamation-circle'));
});
