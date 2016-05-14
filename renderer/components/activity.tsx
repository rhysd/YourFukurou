import * as React from 'react';
import TimelineActivity, {TimelineActivityKind} from '../item/timeline_activity';
import Tweet, {TwitterUser} from '../item/tweet';
import Avatar from './avatar';
import TweetText from './tweet/text';
import ExternalLink from './external_link';

interface TwitterActivityProps extends React.Props<any> {
    activity: TimelineActivity;
}

function renderBadge(kind: TimelineActivityKind) {
    'use strict';
    switch (kind) {
        case 'liked':
            return <span className="activity__icon activity__icon_liked">
                <i className="fa fa-heart"/>
            </span>;
        default:
            return undefined;
    }
}

function renderScreenNameText(user: TwitterUser, key: number = undefined) {
    'use strict';
    const screen_name = '@' + user.screen_name;
    return (
        <ExternalLink
            className="activity__screenname"
            url={user.userPageUrl()}
            title={screen_name}
            key={key}
        >{screen_name}</ExternalLink>
    );
}

function renderScreenNames(activity: TimelineActivity) {
    'use strict';

    const by = activity.by;

    let screen_names = [ renderScreenNameText(by[0]) ];

    if (by.length > 1) {
        for (let i = 1; i < by.length; ++i) {
            screen_names.push(renderScreenNameText(by[i], i));
        }
    }

    const activity_count =
        activity.kind === 'liked' ? activity.status.retweet_count :
        0;
    const num_rest_users = activity_count - screen_names.length;
    if (num_rest_users <= 0) {
        return screen_names;
    }

    screen_names.push(
        <span key="rest"> and {num_rest_users} users</span>
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

const TwitterActivity: React.StatelessComponent<TwitterActivityProps> = props => {
    return (
        <div className="activity">
            <div className="activity__header">
                {renderBadge(props.activity.kind)} Liked by {renderScreenNames(props.activity)}
            </div>
            <div className="activity__text">
                <TweetText status={props.activity.status}/>
            </div>
            <div className="activity__footer">
                {renderUserIcons(props.activity.by)}
            </div>
        </div>
    );
};
export default TwitterActivity;
