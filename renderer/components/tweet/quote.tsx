import * as React from 'react';
import {Twitter} from 'twit';
import TweetItem from '../../item/tweet';
import ScreenName from './screen_name';
import TweetText from './text';
import TweetMedia from './media';

interface QuotedTweetProps extends React.Props<any> {
    status: TweetItem;
    focused: boolean;
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
        <div className="tweet__quoted-header">
            <span
                className="tweet__quoted-icon"
                onClick={e => {
                    e.stopPropagation();
                    s.openStatusPageInBrowser();
                }}
            >
                <i className="fa fa-quote-left"/>
            </span> from <ScreenName
                className="tweet__quoted-screenname"
                user={s.user}
            />
        </div>
    );
}

const QuotedTweet = (props: QuotedTweetProps) => {
    const s = props.status.getMainStatus();
    const class_name =
        props.focused ?
            'tweet__quoted tweet__quoted_focused' :
            'tweet__quoted';
    return <div className={class_name}>
        {renderHeader(s)}
        <TweetText className="tweet__quoted-text" status={s}/>
        {renderMedia(s.media)}
    </div>;
};

export default QuotedTweet;
