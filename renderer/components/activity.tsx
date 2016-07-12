import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import TimelineActivity, {TimelineActivityKind} from '../item/timeline_activity';
import Tweet, {TwitterUser} from '../item/tweet';
import Icon from './icon';
import TweetText from './tweet/text';
import ExternalLink from './external_link';
import log from '../log';
import {
    focusOnItem,
    unfocusItem,
} from '../actions';

const MaxIconsExpanded = 10;
const MaxIconsCollapsed = 4;

interface ConnectedProps extends React.Props<any> {
    activity: TimelineActivity;
    focused?: boolean;
    collapsed?: boolean;
    itemIndex?: number;
}

interface DispatchProps {
    onClick: (e: MouseEvent) => void;
}

type TwitterActivityProps = ConnectedProps & DispatchProps;

function renderBadge(kind: TimelineActivityKind) {
    switch (kind) {
        case 'liked':
            return <span className="activity__icon activity__icon_liked">
                <i className="fa fa-heart"/>
            </span>;
        case 'retweeted':
            return <span className="activity__icon activity__icon_retweeted">
                <i className="fa fa-retweet"/>
            </span>;
        default:
            log.error('Invalid timeline activity:', kind);
            return undefined;
    }
}

function renderUserIcons(users: TwitterUser[], max_icons: number) {
    if (users.length > max_icons) {
        users = users.slice(0, max_icons);
    }

    const icons =
        users.map((u, i) =>
            <Icon
                size={24}
                user={u}
                key={i}
            />
        );

    return <div className="activity__user-icons">
        {icons}
    </div>;
}

function renderExpandedRestUsers(activity: TimelineActivity) {
    const activity_count =
        activity.kind === 'liked' ? activity.status.favorite_count :
        activity.kind === 'retweeted' ? activity.status.retweet_count :
        0;
    const num_rest_users = activity_count - Math.min(activity.by.length, MaxIconsExpanded);
    if (num_rest_users <= 0) {
        return undefined;
    }

    return (
        <span className="activity__rest"> and {num_rest_users} {num_rest_users === 1 ? 'user' : 'users'}</span>
    );
}

function getAbbrCount(count: number) {
    if (count >= 1000000) {
        return (Math.floor(count / 100000) / 10) + 'M';
    } else if (count >= 1000) {
        return (Math.floor(count / 100) / 10) + 'K';
    } else {
        return count.toString();
    }
}

function renderCollapsedRestUsers(activity: TimelineActivity) {
    const activity_count =
        activity.kind === 'liked' ? activity.status.favorite_count :
        activity.kind === 'retweeted' ? activity.status.retweet_count :
        0;
    const num_rest_users = activity_count - Math.min(activity.by.length, MaxIconsCollapsed);
    if (num_rest_users <= 0) {
        return undefined;
    }

    return (
        <span className="activity__rest">+{getAbbrCount(num_rest_users)}</span>
    );
}

function renderCreatedAt(status: Tweet) {
    return (
        <ExternalLink
            className={classNames(
                'activity__created-at',
                {'activity__created-at_focused': true}
            )}
            url={status.statusPageUrl()}
        >{status.getCreatedAtString()}</ExternalLink>
    );
}

function renderExpanded(props: TwitterActivityProps) {
    const {focused, onClick, activity} = props;
    const kind = activity.kind;
    const behaved =
        kind === 'liked' ? 'Liked' :
        kind === 'retweeted' ? 'Retweeted' :
        undefined;

    return (
        <div
            className={classNames('activity', {activity_focused: focused})}
            onClick={onClick}
        >
            <div className="activity__header">
                {renderBadge(kind)} {behaved} by {renderUserIcons(activity.by, MaxIconsExpanded)} {renderExpandedRestUsers(activity)}
                {renderCreatedAt(activity.status)}
            </div>
            <div className="activity__text" title={activity.status.text}>
                <TweetText status={activity.status} focused={focused}/>
            </div>
        </div>
    );
}

function renderCollapsed(props: TwitterActivityProps) {
    const {focused, onClick, activity} = props;
    return (
        <div
            className={classNames(
                'activity activity_mini',
                {'activity_focused': focused}
            )}
            onClick={onClick}
        >
            <div className="activity__header activity__header_mini">
                {renderBadge(activity.kind)} {renderUserIcons(activity.by, MaxIconsCollapsed)} {renderCollapsedRestUsers(activity)}
            </div>
            <div className="activity__text activity__text_mini" title={activity.status.text}>
                <TweetText status={activity.status} focused={focused}/>
            </div>
        </div>
    );
}

export const TwitterActivity: React.StatelessComponent<TwitterActivityProps> =
    props => props.collapsed ?  renderCollapsed(props) : renderExpanded(props);

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            if (props.itemIndex === undefined) {
                return;
            }
            const action = props.focused ?
                unfocusItem() : focusOnItem(props.itemIndex);
            dispatch(action);
        },
    };
}

export default connect(null, mapDispatch)(TwitterActivity);
