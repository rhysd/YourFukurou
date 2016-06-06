import * as React from 'react';
import {Twitter} from 'twit';
import Tweet from '../../item/tweet';
import TweetText from '../tweet/text';
import ScreenName from '../tweet/screen_name';
import {renderPicIcon} from './index';

interface MiniTweetTextProps extends React.Props<any> {
    status: Tweet;
    focused: boolean;
    dispatch: Redux.Dispatch;
}

function renderQuoted(s: Tweet, focused: boolean, dispatch: Redux.Dispatch) {
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
            {renderPicIcon(q, dispatch)}
        </div>
    );
}

const MiniTweetText: React.StatelessComponent<MiniTweetTextProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <div className="mini-tweet__text" title={tw.text}>
            <TweetText status={tw} focused={props.focused}/>
            {renderQuoted(tw, props.focused, props.dispatch)}
        </div>
    );
};
export default MiniTweetText;
