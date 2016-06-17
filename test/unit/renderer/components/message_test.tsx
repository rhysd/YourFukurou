import '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import Message from '../../../../renderer/components/message';
import IconButton from '../../../../renderer/components/icon_button';

function dispatch(a: any) {
    // Do nothing
}

test('show/dismiss message', t => {
    const c = shallow(<Message kind="info" text="This is information message." dispatch={dispatch}/>);
    t.is(c.find('.message__body').length, 1);

    const m = c.find('.message__text');
    t.is(m.text(), 'This is information message.');

    t.true(c.find('.fa.fa-check').length > 0);

    const x = c.find(IconButton);
    t.is(x.props().name, 'times-circle-o');
});

test('show info message', t => {
    const c = shallow(<Message kind="info" text="This is information message." dispatch={dispatch}/>);
    t.is(c.find('.message__body.message__body_info').length, 1);
    t.is(c.find('.fa.fa-check').length, 1);
});

test('show error message', t => {
    const c = shallow(<Message kind="error" text="This is error message." dispatch={dispatch}/>);
    t.is(c.find('.message__body.message__body_error').length, 1);
    t.is(c.find('.fa.fa-exclamation-circle').length, 1);
});

// TODO:
// Test onClick of x button dismisses message.
// Currently I can't do that because it is related to real DOM.
