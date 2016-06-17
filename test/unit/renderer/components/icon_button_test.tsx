import '../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import IconButton from '../../../../renderer/components/icon_button';

test('shows button with named button', t => {
    const c = shallow(<IconButton name="foo"/>);
    t.truthy(c.find('.fa.fa-foo'));
});

test('shows tip on button', t => {
    const c = shallow(<IconButton tip="this is tip" name="foo"/>);
    t.truthy(c.find('[title="this is tip"]'));
});

test('fires onClick callback', t => {
    const cb = spy();
    const c = shallow(<IconButton name="foo" onClick={cb}/>);
    c.simulate('click');
    t.true(cb.called);
    t.is(cb.args.length, 1);
})
