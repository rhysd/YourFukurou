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

function renderScreenNameText(user: TwitterUser, key?: number) {
    'use strict';
    return (
        <ExternalLink
            className="activity__screenname"
            url={user.userPageUrl()}
            title={user.name}
            key={key}
        >{'@' + user.screen_name}</ExternalLink>
    );
}

function renderScreenNames(activity: TimelineActivity) {
    'use strict';

    const by = activity.by;

    let screen_names = [ renderScreenNameText(by[0], 0) ];

    if (by.length > 1) {
        for (let i = 1; i < by.length; ++i) {
            screen_names.push(
                <span key={i}>, {renderScreenNameText(by[i])}</span>
            );
        }
    }

    const activity_count =
        activity.kind === 'liked' ? activity.status.favorite_count :
        activity.kind === 'retweeted' ? activity.status.retweet_count :
        0;
    const num_rest_users = activity_count - by.length;
    if (num_rest_users <= 0) {
        return screen_names;
    }

    screen_names.push(
        <span key="rest"> and {num_rest_users} {num_rest_users === 1 ? 'user' : 'users'}</span>
    )

    return screen_names;
}

function renderUserIcons(users: TwitterUser[]) {
    'use strict';
    return users.map((u, i) =>
            <Avatar
                screenName={u.screen_name}
                imageUrl={u.icon_url_24x24}
                size={24}
                key={i}
            />
        );
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

const TwitterActivity: React.StatelessComponent<TwitterActivityProps> = props => {
    const kind = props.activity.kind;
    const behaved =
        kind === 'liked' ? 'Liked' :
        kind === 'retweeted' ? 'Retweeted' :
        undefined;

    return (
        <div className={props.focused ? 'activity activity_focused' : 'activity'}>
            <div className="activity__header">
                {renderBadge(kind)} {behaved} by {renderScreenNames(props.activity)}
                <span className="spacer"/>
                {renderCreatedAt(props.activity.status, props.focused)}
            </div>
            <div className="activity__text">
                <TweetText status={props.activity.status} focused={props.focused}/>
            </div>
            <div className="activity__footer">
                {renderUserIcons(props.activity.by)}
            </div>
        </div>
    );
};
export default TwitterActivity;
