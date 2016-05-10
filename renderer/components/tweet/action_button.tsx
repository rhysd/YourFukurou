import * as React from 'react';
import {connect} from 'react-redux';
import Tweet from '../../item/tweet';
import IconButton from '../icon_button';
import {
    showMessage,
    sendRetweet,
    undoRetweet,
    createLike,
    destroyLike,
    openEditor,
} from '../../actions';

type TweetActionKind = 'reply' | 'like' | 'retweet';

interface TweetActionButtonProps extends React.Props<any> {
    status: Tweet;
    kind: TweetActionKind;
    isMyTweet?: boolean;
    dispatch?: Redux.Dispatch;
}

function onLikeClicked(props: TweetActionButtonProps) {
    'use strict';
    if (props.status.favorited) {
        props.dispatch(destroyLike(props.status.id));
    } else {
        props.dispatch(createLike(props.status.id));
    }
}

function onRetweetClicked(props: TweetActionButtonProps) {
    'use strict';
    if (props.isMyTweet) {
        props.dispatch(showMessage('You cannot retweet your tweet', 'error'));
        return;
    }
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
    props.dispatch(openEditor(props.status));
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
            } else if (props.isMyTweet) {
                return '#cccccc';
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

function makeCount(count: number) {
    'use strict';
    if (count >= 1000000) {
        return (Math.floor(count / 100000) / 10) + 'M';
    } else if (count >= 1000) {
        return (Math.floor(count / 100) / 10) + 'K';
    } else if (count === 0) {
        return '';
    } else {
        return count.toString();
    }
}

function getCount(props: TweetActionButtonProps) {
    'use strict';
    switch (props.kind) {
        case 'retweet': return makeCount(props.status.retweet_count);
        case 'like':    return makeCount(props.status.favorite_count);
        default:        return '';
    }
}

const TweetActionButton = (props: TweetActionButtonProps) => {
    const icon = getIcon(props.kind);
    const color = getColor(props);
    return <div className="tweet-actions__with-count" style={{color}}>
        <IconButton
            name={icon}
            tip={props.kind}
            className={'tweet-actions__' + props.kind}
            onClick={() => onClick(props)}
        />
        <div className="tweet-actions__count">
            {getCount(props)}
        </div>
    </div>;
};

export default connect()(TweetActionButton);
