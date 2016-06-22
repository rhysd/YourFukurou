import {fixture} from '../../../helper';
import * as React from 'react';
import {shallow} from 'enzyme';
import test from 'ava';
import {List} from 'immutable';
import {spy} from 'sinon';
import {TwitterProfile} from '../../../../../renderer/components/tweet/profile';
import Avatar from '../../../../../renderer/components/avatar';
import FollowButton from '../../../../../renderer/components/tweet/follow_button';
import ExternalLink from '../../../../../renderer/components/external_link';

function doNothing() {
    // do nothing
}

test('show bannar in header', t => {
    const cb = spy();
    const u = fixture.user();
    const c = shallow(
        <TwitterProfile
            user={u}
            friends={List<number>()}
            onBannerClick={cb}
            onIconClick={doNothing}
        />
    );

    const bg = c.find('.user-popup__background');
    t.is(bg.length, 1);
    bg.simulate('click');
    t.true(cb.called);
    const img = bg.childAt(0);
    t.is(img.name(), 'img');
    t.is(img.props().src, u.mini_banner_url);
    t.is(img.props().style.backgroundColor, '#' + u.bg_color);
});

test('show icon and follow button in primary part', t => {
    const cb = spy();
    const u = fixture.user();
    const c = shallow(
        <TwitterProfile
            user={u}
            friends={List<number>()}
            onBannerClick={doNothing}
            onIconClick={cb}
        />
    );

    const a = c.find(Avatar);
    t.true(a.length > 0);
    a.simulate('click');
    t.true(cb.called);
    t.is(a.props().screenName, u.screen_name);

    const fb = c.find(FollowButton);
    t.true(fb.length > 0);
    t.is(fb.props().user.id, u.id);
});

test('show 4 counts (statuses, followings, followers, likes)', t => {
    const c = shallow(
        <TwitterProfile
            user={fixture.user()}
            friends={List<number>()}
            onBannerClick={doNothing}
            onIconClick={doNothing}
        />
    );
    const counts = c.find('.user-popup__counts');
    t.is(counts.children().length, 4);
});

test('show user description', t => {
    const u = fixture.user();
    const c = shallow(
        <TwitterProfile
            user={u}
            friends={List<number>()}
            onBannerClick={doNothing}
            onIconClick={doNothing}
        />
    );
    const desc = c.find('.user-popup__description');
    t.is(desc.text(), u.description);
});

test('show location and website in footer', t => {
    const u = fixture.user();
    const c = shallow(
        <TwitterProfile
            user={u}
            friends={List<number>()}
            onBannerClick={doNothing}
            onIconClick={doNothing}
        />
    );
    const footer = c.find('.user-popup__footer');
    t.is(footer.length, 1);
    const website = footer.find('.user-popup__website').find(ExternalLink);
    t.is(website.props().url, u.user_site_url.expanded_url);
    const loc = footer.find('.user-popup__location');
    t.true(loc.text().indexOf(u.location) !== -1);
});
