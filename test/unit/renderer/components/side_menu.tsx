import {fixture} from '../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {spy} from 'sinon';
import {SideMenu, SideMenuButton} from '../../../../renderer/components/side_menu';

function doNothing() {
    // Do nothing
}

const NonNotified = {
    home: false,
    mention: false,
};

test('home button is active when home timeline', t => {
    const cb = spy();
    const menu = shallow(
        <SideMenu
            user={fixture.user()}
            kind="home"
            notified={NonNotified}
            editor_open={false}
            onEdit={doNothing}
            onHome={cb}
            onMention={doNothing}
        />
    );

    const buttons = menu.find(SideMenuButton);
    t.is(buttons.length, 5);
    t.false(buttons.at(0).props().active);
    t.true(buttons.at(1).props().active);
    t.false(buttons.at(2).props().active);

    buttons.at(1).simulate('click');
    t.true(cb.called);
});

test('mention button is active when mention timeline', t => {
    const cb = spy();
    const menu = shallow(
        <SideMenu
            user={fixture.user()}
            kind="mention"
            notified={NonNotified}
            editor_open={false}
            onEdit={doNothing}
            onHome={doNothing}
            onMention={cb}
        />
    );

    const buttons = menu.find(SideMenuButton);
    t.false(buttons.at(0).props().active);
    t.false(buttons.at(1).props().active);
    t.true(buttons.at(2).props().active);

    buttons.at(2).simulate('click');
    t.true(cb.called);
});

test('edit button will be activated when editing tweet', t => {
    const cb = spy();
    const menu = shallow(
        <SideMenu
            user={fixture.user()}
            kind="home"
            notified={NonNotified}
            editor_open={true}
            onEdit={cb}
            onHome={doNothing}
            onMention={doNothing}
        />
    );

    const buttons = menu.find(SideMenuButton);
    t.true(buttons.at(0).props().active);
    t.true(buttons.at(1).props().active);
    t.false(buttons.at(2).props().active);

    buttons.at(0).simulate('click');
    t.true(cb.called);
});
