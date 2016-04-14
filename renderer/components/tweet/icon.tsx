import * as React from 'react';
import Avatar from '../avatar';

const re_normal_size = /normal(?=\.\w+$)/i;

interface TweetIconProps extends React.Props<any> {
    user: TweetUser;
}

const TweetIcon = (props: TweetIconProps) => {
    let profile_url = props.user.profile_image_url_https;
    if (window.devicePixelRatio || 1 >= 1.5) {
        profile_url = profile_url.replace(re_normal_size, 'bigger');
    }
    return <div className="tweet__icon">
        <Avatar
        size={48}
         screenName={props.user.screen_name}
         imageUrl={profile_url}
         border="#d0d0d0"
        />
    </div>;
}
export default TweetIcon;
