import * as React from 'react';
import TweetItem, {TwitterUser} from '../../item/tweet';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';
import TweetIcon from './icon';

// TODO:
// Enable to expand/contract tweet panel like as YoruFukurou
// TODO:
// Enable to focus/unfocus tweet panel like as YoruFukurou

interface TweetProps extends React.Props<any> {
    status: TweetItem;
    user: TwitterUser;
}

const Tweet = (props: TweetProps) => {
    const tw = props.status.getMainStatus();
    return (
        <div className="tweet__body">
            <TweetIcon user={tw.user}/>
            <TweetSecondary status={props.status}/>
            <TweetPrimary status={props.status} user={props.user}/>
        </div>
    );
};
export default Tweet;
