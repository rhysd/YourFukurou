import * as React from 'react';
import TweetItem from '../../item/tweet';
import ScreenName from './screen_name';
import TweetIcon from './icon';

interface QuotedTweetProps extends React.Props<any> {
    status: TweetItem;
}

const QuotedTweet = (props: QuotedTweetProps) => {
    const s = props.status.getMainStatus();
    return <div className="tweet__quoted">
        <div className="tweet__quoted-screenname">
        <i
            className="fa fa-quote-left"
            style={{marginRight: '4px'}}
        /> from <ScreenName
            user={s.user}
            color="#777777"
        />
        </div>
        <div
            className="tweet__quoted-text"
            dangerouslySetInnerHTML={{__html: s.buildLinkedHTML()}}
        />
    </div>
};
export default QuotedTweet;
