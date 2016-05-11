import * as React from 'react';
import Avatar from '../avatar';
import {TwitterUser} from '../../item/tweet';

interface TweetIconProps extends React.Props<any> {
    user: TwitterUser;
}

const TweetIcon = (props: TweetIconProps) => (
    <div className="tweet__icon">
        <Avatar
        size={48}
         screenName={props.user.screen_name}
         imageUrl={props.user.icon_url}
         border="#d0d0d0"
        />
    </div>
);
export default TweetIcon;
