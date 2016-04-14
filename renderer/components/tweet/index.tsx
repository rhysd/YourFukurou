import * as React from 'react';
import Avatar from '../avatar';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';

// TODO:
// Enable to expand/contract tweet panel like as YoruFukurou
// TODO:
// Enable to focus/unfocus tweet panel like as YoruFukurou

const re_normal_size = /normal(?=\.(:?jpg|png|gif))/i;

interface TweetProps extends React.Props<any> {
    status: TweetStatus;
}

const Tweet = (props: TweetProps) => {
    const tw = props.status.retweeted_status || props.status;
    let profile_url = tw.user.profile_image_url_https;
    if (window.devicePixelRatio || 1 >= 1.5) {
        profile_url = profile_url.replace(re_normal_size, 'bigger');
    }
    return <div className="tweet__body">
        <div className="tweet__icon">
            <Avatar size={48} screenName={tw.user.screen_name} imageUrl={profile_url} border="#d0d0d0"/>
        </div>
        <TweetSecondary status={props.status}/>
        <TweetPrimary status={tw}/>
    </div>;
}
export default Tweet;
