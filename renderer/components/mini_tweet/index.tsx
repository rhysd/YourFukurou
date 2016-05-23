import * as React from 'react';
import Tweet, {TwitterUser} from '../../item/tweet';
import MiniTweetIcon from './icon';
import MiniTweetSecondary from './secondary';
import MiniTweetText from './text';
import {TimelineKind} from '../../states/timeline';

interface MiniTweetProps extends React.Props<any> {
    status: Tweet;
    owner: TwitterUser;
    timeline: TimelineKind;
    onClick: (e: React.MouseEvent) => void;
    focused?: boolean;
    related?: boolean;
    focused_user?: boolean;
    dispatch: Redux.Dispatch;
}

function getClass(tw: Tweet, props: MiniTweetProps) {
    'use strict';
    if (props.focused) {
        return 'mini-tweet mini-tweet_focused';
    }

    if (tw.mentionsTo(props.owner) && props.timeline !== 'mention') {
        return 'mini-tweet mini-tweet_mention';
    }

    if (props.related) {
        return 'mini-tweet mini-tweet_related';
    }

    if (props.focused_user) {
        return 'mini-tweet mini-tweet_user-related';
    }

    return 'mini-tweet';
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

const MiniTweet: React.StatelessComponent<MiniTweetProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <div className={getClass(tw, props)} onClick={props.onClick}>
            <MiniTweetIcon user={tw.user} quoted={tw.isQuotedTweet()}/>
            <MiniTweetSecondary status={props.status} focused={props.focused}/>
            <MiniTweetText status={props.status} focused={props.focused}/>
            {renderPicIcon(tw)}
        </div>
    );
};
export default MiniTweet;
