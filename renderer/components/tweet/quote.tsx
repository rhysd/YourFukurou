import * as React from 'react';
import {Twitter} from 'twit';
import TweetItem from '../../item/tweet';
import ScreenName from './screen_name';
import TweetIcon from './icon';
import TweetText from './text';
import TweetMedia from './media';

interface QuotedTweetProps extends React.Props<any> {
    status: TweetItem;
}

function renderMedia(media: Twitter.MediaEntity[]) {
    'use strict';
    if (media.length === 0) {
        return undefined;
    }
    return <TweetMedia entities={media}/>;
}

function renderHeader(s: TweetItem) {
    'use strict';
    return (
        <div className="tweet__quoted-screenname">
            <span
                className="tweet__quoted-icon"
                onClick={() => s.openStatusPageInBrowser()}
            >
                <i className="fa fa-quote-left"/>
            </span> from <ScreenName
                user={s.user}
                color="#777777"
            />
        </div>
    );
}

const QuotedTweet = (props: QuotedTweetProps) => {
    const s = props.status.getMainStatus();
    return <div className="tweet__quoted">
        {renderHeader(s)}
        <TweetText className="tweet__quoted-text" status={s}/>
        {renderMedia(s.media)}
    </div>;
};

export default QuotedTweet;
