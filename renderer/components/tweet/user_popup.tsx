import * as React from 'react';
import Avatar from '../avatar';
import ScreenName from './screen_name';
import {TwitterUser} from '../../item/tweet';
import ExternalLink from './external-link';

interface TwitterUserPopup extends React.Props<any> {
    user: TwitterUser;
}

function renderBannar(user: TwitterUser) {
    'use strict';
    const bg_color_style = {
        backgroundColor: '#'+user.bg_color
    };
    if (user.banner_url) {
        return <div className="user-popup__background">
                <img src={user.banner_url} style={bg_color_style}/>
            </div>;
    } else {
        return <div className="user-popup__background" style={bg_color_style}>
            </div>;
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
                color="black"
            >{user.statuses_count}</ExternalLink>
        </div>
        <div className="user-popup__count">
            <div className="user-popup__count-name">Following</div>
            <ExternalLink
                className="user-popup__count-value"
                url={user.followingPageUrl()}
                color="black"
            >{user.followings_count}</ExternalLink>
        </div>
        <div className="user-popup__count">
            <div className="user-popup__count-name">Followers</div>
            <ExternalLink
                className="user-popup__count-value"
                url={user.followerPageUrl()}
                color="black"
            >{user.followers_count}</ExternalLink>
        </div>
        <div className="user-popup__count">
            <div className="user-popup__count-name">Likes</div>
            <ExternalLink
                className="user-popup__count-value"
                url={user.likePageUrl()}
                color="black"
            >{user.likes_count}</ExternalLink>
        </div>
    </div>
);

const TwitterUserPopup = (props: TwitterUserPopup) => {
    const u = props.user;
    return (
        <div className="user-popup">
            {renderBannar(u)}
            {renderPrimary(u)}
            {renderCounts(u)}
            <div className="user-popup__description">
                {u.description}
            </div>
        </div>
    );
};
export default TwitterUserPopup;
