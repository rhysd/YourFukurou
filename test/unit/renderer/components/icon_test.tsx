import {fixture, provide} from '../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import Icon from '../../../../renderer/components/icon';

test.beforeEach(t => {
    t.context.user = fixture.user();
});

test('shows user icon with tip', t => {
    const c = shallow(provide(<Icon user={t.context.user} size={48}/>));
    t.truthy(c.find('.user-icon'));
    t.truthy(c.find('[title="@Linda_pp"]'));
    const img = c.find('.foo-bar-poyo');
    t.truthy(img);
});

