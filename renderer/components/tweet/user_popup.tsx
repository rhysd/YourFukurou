import * as React from 'react';
import Avatar from '../avatar';
import ScreenName from './screen_name';
import ExternalLink from '../external_link';
import {TwitterUser} from '../../item/tweet';
import {openPicturePreview} from '../../actions';

interface TwitterUserPopup extends React.Props<any> {
    user: TwitterUser;
    dispatch: Redux.Dispatch;
}

function renderBannar(user: TwitterUser, dispatch: Redux.Dispatch) {
    'use strict';
    const bg_color_style = {
        backgroundColor: '#' + user.bg_color,
    };
    const url = user.mini_banner_url;
    if (url) {
        return (
            <div
                className="user-popup__background"
                style={{cursor: 'pointer'}}
                onClick={() => dispatch(openPicturePreview([user.big_banner_url]))}
            >
                <img src={url} style={bg_color_style}/>
            </div>
        );
    } else {
        return <div className="user-popup__background" style={bg_color_style}/>;
    }
}

const renderPrimary = (user: TwitterUser) => (
    <div className="user-popup__primary">
        <div className="user-popup__main-icon">
            <Avatar
                size={64}
                screenName={user.screen_name}
                imageUrl={user.big_icon_url}
                border="4px solid white"
            />
        </div>
        <div className="user-popup__name">
            <span className="user-popup__user-name">
                {user.name}
            </span>
            <ScreenName user={user}/>
        </div>
    </div>
);

const renderCounts = (user: TwitterUser) => (
    <div className="user-popup__counts">
        <div className="user-popup__count">
            <div className="user-popup__count-name">Tweets</div>
            <ExternalLink
                className="user-popup__count-value"
                url={user.userPageUrl()}
            >{user.statuses_count}</ExternalLink>
        </div>
        <div className="user-popup__count">
            <div className="user-popup__count-name">Following</div>
            <ExternalLink
                className="user-popup__count-value"
                url={user.followingPageUrl()}
            >{user.followings_count}</ExternalLink>
        </div>
        <div className="user-popup__count">
            <div className="user-popup__count-name">Followers</div>
            <ExternalLink
                className="user-popup__count-value"
                url={user.followerPageUrl()}
            >{user.followers_count}</ExternalLink>
        </div>
        <div className="user-popup__count">
            <div className="user-popup__count-name">Likes</div>
            <ExternalLink
                className="user-popup__count-value"
                url={user.likePageUrl()}
            >{user.likes_count}</ExternalLink>
        </div>
    </div>
);

function renderWebsiteUrl(user: TwitterUser) {
    'use strict';
    const url = user.user_site_url;
    if (!url) {
        return undefined;
    }
    return <div className="user-popup__website">
        <i className="fa fa-link" style={{marginRight: '4px'}}/>
        <ExternalLink className="user-popup__website-url" url={url.expanded_url}>{url.display_url}</ExternalLink>
    </div>;
}

function renderLocation(user: TwitterUser) {
    'use strict';
    const loc = user.location;
    if (!loc) {
        return undefined;
    }
    return <div className="user-popup__location">
        <i className="fa fa-location-arrow" style={{marginRight: '4px'}}/>{loc}
    </div>;
}

function renderFooter(user: TwitterUser) {
    'use strict';
    const website_url = renderWebsiteUrl(user);
    const location = renderLocation(user);
    if (!website_url && !location) {
        return undefined;
    }
    return (
        <div className="user-popup__footer">
            {website_url}
            {location}
        </div>
    );
}

const TwitterUserPopup = (props: TwitterUserPopup) => {
    const u = props.user;
    return (
        <div className="user-popup">
            {renderBannar(u, props.dispatch)}
            {renderPrimary(u)}
            {renderCounts(u)}
            <div className="user-popup__description">
                {u.description}
            </div>
            {renderFooter(u)}
        </div>
    );
};
export default TwitterUserPopup;
