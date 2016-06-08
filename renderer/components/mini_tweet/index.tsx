import * as React from 'react';
import {connect} from 'react-redux';
import Tweet, {TwitterUser} from '../../item/tweet';
import MiniTweetIcon from './icon';
import MiniTweetSecondary from './secondary';
import MiniTweetText from './text';
import UndraggableClickable from '../undraggable_clickable';
import {TimelineKind} from '../../states/timeline';
import {openPicturePreview} from '../../actions';

interface ConnectedProps extends React.Props<any> {
    status: Tweet;
    owner: TwitterUser;
    timeline: TimelineKind;
    onClick: (e: React.MouseEvent) => void;
    focused?: boolean;
    related?: boolean;
    focused_user?: boolean;
}

interface DispatchProps {
    onPicClicked: (e: React.MouseEvent) => void;
}

type MiniTweetProps = ConnectedProps & DispatchProps;

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

export function renderPicIcon(tw: Tweet, onClick: (e: React.MouseEvent) => void) {
    'use strict';
    const media = tw.media;
    if (media.length === 0) {
        return undefined;
    }

    return (
        <div className="mini-tweet__has-pic" onClick={onClick}>
            <i className="fa fa-picture-o"/>
        </div>
    );
}

const MiniTweet: React.StatelessComponent<MiniTweetProps> = props => {
    const {status, onClick, focused, onPicClicked} = props;
    const tw = status.getMainStatus();
    return (
        <UndraggableClickable className={getClass(tw, props)} onClick={onClick}>
            <MiniTweetIcon user={tw.user} quoted={tw.isQuotedTweet()}/>
            <MiniTweetSecondary status={status} focused={focused}/>
            <MiniTweetText status={status} focused={focused}/>
            {renderPicIcon(tw, onPicClicked)}
        </UndraggableClickable>
    );
};

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    'use strict';
    return {
        onPicClicked: e => {
            e.stopPropagation();
            const urls = props.status.getMainStatus().media.map(m => m.media_url);
            dispatch(openPicturePreview(urls));
        },
    };
}

export default connect(null, mapDispatch)(MiniTweet);
