import * as React from 'react';
import {connect} from 'react-redux';
import Tweet, {TwitterUser} from '../../item/tweet';
import IconButton from '../icon_button';
import {
    showMessage,
    openEditorForReply,
    retweetSucceeded,
    unretweetSucceeded,
    likeSucceeded,
    unlikeSucceeded,
} from '../../actions';
import TwitterRestApi from '../../twitter/rest_api';

type TweetActionKind = 'reply' | 'like' | 'retweet';

interface ConnectedProps extends React.Props<any> {
    status: Tweet;
    kind: TweetActionKind;
    owner?: TwitterUser;
}

interface DispatchProps {
    onClick: (e: React.MouseEvent) => void;
}

type TweetActionButtonProps = ConnectedProps & DispatchProps;

function onLikeClicked(status: Tweet, dispatch: Redux.Dispatch) {
    if (status.favorited) {
        TwitterRestApi.unlike(status.id).then(json => {
            dispatch(unlikeSucceeded(new Tweet(json)));
        });
    } else {
        TwitterRestApi.like(status.id).then(json => {
            dispatch(likeSucceeded(new Tweet(json)));
        });
    }
}

function onRetweetClicked(status: Tweet, dispatch: Redux.Dispatch) {
    if (status.user.protected) {
        dispatch(showMessage("Cannot retweet protected user's tweet", 'error'));
        return;
    }

    if (status.retweeted) {
        TwitterRestApi.unretweet(status.id)
            .then(json => dispatch(unretweetSucceeded(new Tweet(json))));
    } else {
        TwitterRestApi.retweet(status.id)
            .then(json => dispatch(retweetSucceeded(new Tweet(json))));
    }
}

function getIcon(k: TweetActionKind) {
    switch (k) {
        case 'reply': return 'reply';
        case 'retweet': return 'retweet';
        case 'like': return 'heart';
        default: return '';
    }
}

function getColor(props: TweetActionButtonProps) {
    switch (props.kind) {
        case 'retweet': return props.status.retweeted ? '#19cf86' : undefined;
        case 'like':    return props.status.favorited ? '#ff4f44' : undefined;
        default:        return undefined;
    }
}

function makeCount(count: number) {
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
    switch (props.kind) {
        case 'retweet': return makeCount(props.status.retweet_count);
        case 'like':    return makeCount(props.status.favorite_count);
        default:        return '';
    }
}

export const TweetActionButton = (props: TweetActionButtonProps) => {
    const icon = getIcon(props.kind);
    const color = getColor(props);
    return <div className="tweet-actions__with-count" style={{color}}>
        <IconButton
            name={icon}
            tip={props.kind}
            className={'tweet-actions__' + props.kind}
            onClick={props.onClick}
        />
        <div className="tweet-actions__count">
            {getCount(props)}
        </div>
    </div>;
};

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            switch (props.kind) {
                case 'reply':   dispatch(openEditorForReply(props.status, props.owner)); break;
                case 'retweet': onRetweetClicked(props.status, dispatch); break;
                case 'like':    onLikeClicked(props.status, dispatch); break;
                default:        break;
            }
        },
    };
}

export default connect(null, mapDispatch)(TweetActionButton);
