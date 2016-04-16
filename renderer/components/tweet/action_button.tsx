import * as React from 'react';
import {connect} from 'react-redux';
import Tweet from '../../item/tweet';
import IconButton from '../icon_button';
import {showMessage} from '../../actions';

type TweetActionKind = 'reply' | 'fav' | 'retweet';

interface TweetActionButtonProps extends React.Props<any> {
    status: Tweet;
    kind: TweetActionKind;
    dispatch?: Redux.Dispatch;
}

function notImplementedYet(props: TweetActionButtonProps) {
    'use strict';
    props.dispatch(showMessage('Sorry, this feature is not implemented yet.', 'error'));
}

function onFavClicked(props: TweetActionButtonProps) {
    'use strict';
    notImplementedYet(props);
}

function onRetweetClicked(props: TweetActionButtonProps) {
    'use strict';
    notImplementedYet(props);
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
        case 'fav': onFavClicked(props); break;
        default: break;
    }
}

function getIcon(k: TweetActionKind) {
    'use strict';
    switch (k) {
        case 'reply': return 'reply';
        case 'retweet': return 'retweet';
        case 'fav': return 'heart';
        default: return '';
    }
}

function getColor(props: TweetActionButtonProps) {
    'use strict';
    switch (props.kind) {
        case 'retweet': {
            if (props.status.retweeted) {
                return '#4fff44';
            } else {
                return undefined;
            }
        }
        case 'fav': {
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
