import * as React from 'react';
import Avatar from '../avatar';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';

// TODO:
// Enable to expand/contract tweet panel like as YoruFukurou
// TODO:
// Enable to focus/unfocus tweet panel like as YoruFukurou

interface TweetProps extends React.Props<any> {
    status: TweetStatus;
}

const Tweet = (props: TweetProps) => {
    const tw = props.status.retweeted_status || props.status;
    return <div className="tweet__body">
        <div className="tweet__icon">
            <Avatar size={48} screenName={tw.user.screen_name} imageUrl={tw.user.profile_image_url_https} border="#d0d0d0"/>
        </div>
        <TweetSecondary status={props.status}/>
        <TweetPrimary status={props.status}/>
    </div>;
}
export default Tweet;
