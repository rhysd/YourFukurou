import * as React from 'react';
import Tweet, {TwitterUser} from '../../item/tweet';
import MiniTweetIcon from './icon';
import MiniTweetSecondary from './secondary';
import MiniTweetText from './text';
import UndraggableClickable from '../undraggable_clickable';
import {TimelineKind} from '../../states/timeline';
import {openPicturePreview} from '../../actions';

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

export function renderPicIcon(tw: Tweet, dispatch: Redux.Dispatch) {
    'use strict';
    const media = tw.media;
    if (media.length === 0) {
        return undefined;
    }

    const open_media = () => dispatch(openPicturePreview(media.map(m => m.media_url)));

    return (
        <div className="mini-tweet__has-pic" onClick={open_media}>
            <i className="fa fa-picture-o"/>
        </div>
    );
}

const MiniTweet: React.StatelessComponent<MiniTweetProps> = props => {
    const {status, onClick, focused, dispatch} = props;
    const tw = status.getMainStatus();
    return (
        <UndraggableClickable className={getClass(tw, props)} onClick={onClick}>
            <MiniTweetIcon user={tw.user} quoted={tw.isQuotedTweet()}/>
            <MiniTweetSecondary status={status} focused={focused}/>
            <MiniTweetText status={status} focused={focused} dispatch={dispatch}/>
            {renderPicIcon(tw, dispatch)}
        </UndraggableClickable>
    );
};
export default MiniTweet;
