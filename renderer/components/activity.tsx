import * as React from 'react';
import TimelineActivity, {TimelineActivityKind} from '../item/timeline_activity';
import Tweet, {TwitterUser} from '../item/tweet';
import Avatar from './avatar';
import TweetText from './tweet/text';
import ExternalLink from './external_link';
import log from '../log';

interface TwitterActivityProps extends React.Props<any> {
    activity: TimelineActivity;
    focused?: boolean;
    collapsed?: boolean;
    onClick?: (e: MouseEvent) => void;
}

function renderBadge(kind: TimelineActivityKind) {
    'use strict';
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

function renderUserIcons(users: TwitterUser[]) {
    'use strict';

    const icons =
        users.map((u, i) =>
            <Avatar
                screenName={u.screen_name}
                imageUrl={u.icon_url_24x24}
                size={24}
                title={'@' + u.screen_name}
                key={i}
            />
        );

    return <div className="activity__user-icons">
        {icons}
    </div>;
}

function renderRestUsers(activity: TimelineActivity) {
    'use strict';

    const activity_count =
        activity.kind === 'liked' ? activity.status.favorite_count :
        activity.kind === 'retweeted' ? activity.status.retweet_count :
        0;
    const num_rest_users = activity_count - activity.by.length;
    if (num_rest_users <= 0) {
        return undefined;
    }

    return <span className="activity__rest"> and {num_rest_users} {num_rest_users === 1 ? 'user' : 'users'}</span>
}

function renderCreatedAt(status: Tweet, focused: boolean) {
    'use strict';
    return (
        <ExternalLink
            className={focused ?
                'activity__created-at activity__created-at_focused' :
                'activity__created-at'}
            url={status.statusPageUrl()}
        >{status.getCreatedAtString()}</ExternalLink>
    );
}

function renderExpanded(props: TwitterActivityProps) {
    'use strict';
    const {focused, onClick, activity} = props;
    const kind = activity.kind;
    const behaved =
        kind === 'liked' ? 'Liked' :
        kind === 'retweeted' ? 'Retweeted' :
        undefined;

    return (
        <div
            className={focused ? 'activity activity_focused' : 'activity'}
            onClick={onClick}
        >
            <div className="activity__header">
                {renderBadge(kind)} {behaved} by {renderUserIcons(activity.by)} {renderRestUsers(activity)}
                {renderCreatedAt(activity.status, focused)}
            </div>
            <div className="activity__text" title={activity.status.text}>
                <TweetText status={activity.status} focused={focused}/>
            </div>
        </div>
    );
}

function renderCollapsed(props: TwitterActivityProps) {
    'use strict';
    const {focused, onClick, activity} = props;
    return (
        <div
            className={focused ?
                    'activity activity_mini activity_focused' :
                    'activity activity_mini'}
            onClick={onClick}
        >
            <div className="activity__header activity__header_mini">
                {renderBadge(activity.kind)} {renderUserIcons(activity.by)}
            </div>
            <div className="activity__text activity__text_mini" title={activity.status.text}>
                <TweetText status={activity.status} focused={focused}/>
            </div>
        </div>
    );
}

const TwitterActivity: React.StatelessComponent<TwitterActivityProps> =
    props => props.collapsed ?  renderCollapsed(props) : renderExpanded(props);
export default TwitterActivity;
