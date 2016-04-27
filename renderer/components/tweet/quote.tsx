import * as React from 'react';
import TweetItem from '../../item/tweet';
import ScreenName from './screen_name';
import TweetIcon from './icon';

interface QuotedTweetProps extends React.Props<any> {
    status: TweetItem;
}

const QuotedTweet = (props: QuotedTweetProps) => (
    <div className="tweet__quoted">
        <div className="tweet__quoted-screenname">
        <i
            className="fa fa-quote-left"
            style={{marginRight: '4px'}}
        /> from <ScreenName
            user={props.status.user}
            color="#777777"
        />
        </div>
        <div
            className="tweet__quoted-text"
            dangerouslySetInnerHTML={{__html: props.status.buildLinkedHTML()}}
        />
    </div>
);
export default QuotedTweet;
