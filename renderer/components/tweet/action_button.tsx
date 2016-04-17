import * as React from 'react';
import {connect} from 'react-redux';
import Tweet from '../../item/tweet';
import IconButton from '../icon_button';
import {showMessage, sendRetweet, undoRetweet} from '../../actions';

type TweetActionKind = 'reply' | 'like' | 'retweet';

interface TweetActionButtonProps extends React.Props<any> {
    status: Tweet;
    kind: TweetActionKind;
    dispatch?: Redux.Dispatch;
}

function notImplementedYet(props: TweetActionButtonProps) {
    'use strict';
    props.dispatch(showMessage('Sorry, this feature is not implemented yet.', 'error'));
}

function onLikeClicked(props: TweetActionButtonProps) {
    'use strict';
    notImplementedYet(props);
}

function onRetweetClicked(props: TweetActionButtonProps) {
    'use strict';
    if (props.status.user.protected) {
        props.dispatch(showMessage("Cannot retweet protected user's tweet", 'error'));
        return;
    }

    if (props.status.retweeted) {
        props.dispatch(undoRetweet(props.status.id));
    } else {
        props.dispatch(sendRetweet(props.status.id));
    }
}

function onReplyClicked(props: TweetActionButtonProps) {
    'use strict';
    notImplementedYet(props);
}

function onClick(props: TweetActionButtonProps) {
    'use strict';
    switch (props.kind) {
        case 'reply': onReplyClicked(props); break;
        case 'retweet': onRetweetClicked(props); break;
        case 'like': onLikeClicked(props); break;
        default: break;
    }
}

function getIcon(k: TweetActionKind) {
    'use strict';
    switch (k) {
        case 'reply': return 'reply';
        case 'retweet': return 'retweet';
        case 'like': return 'heart';
        default: return '';
    }
}

function getColor(props: TweetActionButtonProps) {
    'use strict';
    switch (props.kind) {
        case 'retweet': {
            if (props.status.retweeted) {
                return '#19cf86';
            } else {
                return undefined;
            }
        }
        case 'like': {
            if (props.status.favorited) {
                return '#ff4f44';
            } else {
                return undefined;
            }
        }
        default: return undefined;
    }
}

const TweetActionButton = (props: TweetActionButtonProps) => {
    const icon = getIcon(props.kind);
    return <IconButton
        className={'tweet-actions__' + props.kind}
        name={icon}
        tip={icon}
        color={getColor(props)}
        onClick={() => onClick(props)}
    />;
};

export default connect()(TweetActionButton);
