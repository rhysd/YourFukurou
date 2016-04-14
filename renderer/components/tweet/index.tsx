import * as React from 'react';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';
import TweetIcon from './icon';

// TODO:
// Enable to expand/contract tweet panel like as YoruFukurou
// TODO:
// Enable to focus/unfocus tweet panel like as YoruFukurou

interface TweetProps extends React.Props<any> {
    status: TweetStatus;
}

const Tweet = (props: TweetProps) => {
    const tw = props.status.retweeted_status || props.status;
    return <div className="tweet__body animated fadeIn">
        <TweetIcon user={tw.user}/>
        <TweetSecondary status={props.status}/>
        <TweetPrimary status={tw}/>
    </div>;
}
export default Tweet;
