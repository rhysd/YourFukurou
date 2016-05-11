import * as React from 'react';
import Avatar from '../avatar';
import ScreenName from './screen_name';
import {TwitterUser} from '../../item/tweet';

interface TwitterUserPopup extends React.Props<any> {
    user: TwitterUser;
}

function renderBannar(user: TwitterUser) {
    'use strict';
    const img =
        user.bannar_url ?
            <img
                src={user.bannar_url}
            /> :
            undefined;
    return (
        <div
            className="user-popup__background"
            style={{backgroundColor: '#'+user.bg_color}}
        >
            {img}
        </div>
    );
}

function renderPrimary(user: TwitterUser) {
    'use strict';
    return (
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
}

const TwitterUserPopup = (props: TwitterUserPopup) => {
    const u = props.user;
    return (
        <div className="user-popup">
            {renderBannar(u)}
            {renderPrimary(u)}
            <div className="user-popup__description">
                {u.description}
            </div>
        </div>
    );
};
export default TwitterUserPopup;
