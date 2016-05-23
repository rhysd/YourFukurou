import * as React from 'react';
import Tweet from '../../item/tweet';
import TweetText from '../tweet/text';

interface MiniTweetTextProps extends React.Props<any> {
    status: Tweet;
    focused: boolean;
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
            <TweetText className="mini-tweet__quoted-text" status={q}/>
        </div>
    )
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
}
export default MiniTweetText;
