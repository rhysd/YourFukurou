import * as React from 'react';
import {Twitter} from 'twit';
import TweetItem from '../../item/tweet';
import ScreenName from './screen_name';
import TweetIcon from './icon';
import TweetText from './text';
import TweetMedia from './media';
import {openExternalLink} from './external-link';

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
        <TweetText className="tweet__quoted-text" status={s}/>
        {renderMedia(s.media)}
    </div>;
};

export default QuotedTweet;
