import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Avatar from '../avatar';
import ScreenName from './screen_name';
import FollowButton from './follow_button';
import ExternalLink from '../external_link';
import {TwitterUser} from '../../item/tweet';
import {openPicturePreview} from '../../actions';

type Size = 'normal' | 'big';

interface ConnectedProps extends React.Props<any> {
    user: TwitterUser;
    friends?: List<number>;
    size?: Size;
}

interface DispatchProps {
    onBannerClick: (e: React.MouseEvent) => void;
    onIconClick: (e: React.MouseEvent) => void;
}

type TwitterProfileProps = ConnectedProps & DispatchProps;

function renderBannar(props: TwitterProfileProps) {
    const {user, onBannerClick, size} = props;
    const bg_color_style = {
        backgroundColor: '#' + user.bg_color,
    };
    const url = size && size === 'big' ? user.max_size_banner_url : user.mini_banner_url;
    if (url) {
        return (
            <div
                className="user-popup__background"
                style={{cursor: 'pointer'}}
                onClick={onBannerClick}
            >
                <img src={url} style={bg_color_style}/>
            </div>
        );
    } else {
        return <div className="user-popup__background" style={bg_color_style}/>;
    }
}

const renderPrimary = (props: TwitterProfileProps) => {
    const {user, friends, onIconClick} = props;
    return (
        <div className="user-popup__primary">
            <div className="user-popup__main-icon">
                <Avatar
                    size={64}
                    screenName={user.screen_name}
                    imageUrl={user.icon_url_73x73}
                    border="4px solid white"
                    onClick={onIconClick}
                />
            </div>
            <div className="user-popup__name">
                <span className="user-popup__user-name" title={user.name}>
                    {user.name}
                </span>
                <ScreenName className="user-popup__screenname" user={user}/>
            </div>
            <div className="spacer"/>
            <FollowButton user={user} friends={friends}/>
        </div>
    );
};

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
    const loc = user.location;
    if (!loc) {
        return undefined;
    }
    return <div className="user-popup__location">
        <i className="fa fa-location-arrow" style={{marginRight: '4px'}}/>{loc}
    </div>;
}

function renderFooter(user: TwitterUser) {
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

export const TwitterProfile = (props: TwitterProfileProps) => {
    const u = props.user;
    const style = {
        width: props.size && props.size === 'big' ? undefined : '300px',
    };
    return (
        <div className="user-popup" style={style}>
            {renderBannar(props)}
            {renderPrimary(props)}
            {renderCounts(u)}
            <div className="user-popup__description">
                {u.description}
            </div>
            {renderFooter(u)}
        </div>
    );
};

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onBannerClick: e => {
            e.stopPropagation();
            const url = props.user.max_size_banner_url;
            if (url !== null) {
                dispatch(openPicturePreview([url]));
            }
        },
        onIconClick: e => {
            e.stopPropagation();
            dispatch(openPicturePreview([props.user.original_icon_url]));
        },
    };
}

export default connect(null, mapDispatch)(TwitterProfile);
