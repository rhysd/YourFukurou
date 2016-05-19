import * as React from 'react';
import Tooltip = require('rc-tooltip');
import {List} from 'immutable';
import Avatar from '../avatar';
import {TwitterUser} from '../../item/tweet';
import TwitterProfile from './profile';

interface TweetIconProps extends React.Props<any> {
    user: TwitterUser;
    friends: List<number>;
    dispatch: Redux.Dispatch;
}

// TODO:
// Calculate the placement from the position of icon
const TweetIcon = (props: TweetIconProps) => (
    <Tooltip
        placement="bottomRight"
        overlay={
            <TwitterProfile
                user={props.user}
                friends={props.friends}
                dispatch={props.dispatch}
            />
        }
    >
        <div className="tweet__icon">
            <Avatar
                size={48}
                screenName={props.user.screen_name}
                imageUrl={props.user.icon_url_73x73}
                border="1px solid #d0d0d0"
            />
        </div>
    </Tooltip>
);
export default TweetIcon;
