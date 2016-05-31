import * as React from 'react';
import Tweet from '../../item/tweet';
import TweetText from '../tweet/text';
import ScreenName from '../tweet/screen_name';

interface MiniTweetTextProps extends React.Props<any> {
    status: Tweet;
    focused: boolean;
}

function renderPicIcon(tw: Tweet) {
    'use strict';
    if (tw.media.length === 0) {
        return undefined;
    }
    return (
        <div className="mini-tweet__has-pic">
            <i className="fa fa-picture-o"/>
        </div>
    );
}

function renderQuoted(s: Tweet, focused: boolean) {
    'use strict';
    const q = s.quoted_status;
    if (q === null) {
        return undefined;
    }
    return (
        <div
            className={
                focused ?
                    'mini-tweet__quoted mini-tweet__quote_focused' :
                    'mini-tweet__quoted'
            }
            title={q.text}
        >
            <span className="mini-tweet__quoted-icon">
                <i className="fa fa-quote-left"/>
            </span>
            <ScreenName className="mini-tweet__quoted-screenname" user={q.user}/>
            <TweetText className="mini-tweet__quoted-text" status={q}/>
            {renderPicIcon(q)}
        </div>
    );
}

// TODO: Quoted tweet
const MiniTweetText: React.StatelessComponent<MiniTweetTextProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <div className="mini-tweet__text" title={tw.text}>
            <TweetText status={tw} focused={props.focused}/>
            {renderQuoted(tw, props.focused)}
        </div>
    );
};
export default MiniTweetText;
