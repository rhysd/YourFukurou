import * as React from 'react';
import Tooltip = require('rc-tooltip');
import Avatar from '../avatar';
import {TwitterUser} from '../../item/tweet';
import TwitterUserPopup from './user_popup';

interface TweetIconProps extends React.Props<any> {
    user: TwitterUser;
}

// TODO:
// Calculate the placement from the position of icon
const TweetIcon = (props: TweetIconProps) => (
    <Tooltip
        placement="bottomRight"
        overlay={<TwitterUserPopup user={props.user}/>}
    >
        <div className="tweet__icon">
            <Avatar
                size={48}
                screenName={props.user.screen_name}
                imageUrl={props.user.icon_url}
                border="1px solid #d0d0d0"
            />
        </div>
    </Tooltip>
);
export default TweetIcon;
