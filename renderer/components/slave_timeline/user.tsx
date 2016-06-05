import * as React from 'react';
import {List} from 'immutable';
import TwitterProfile from '../tweet/profile';
import Tweet from '../tweet/index';
import Item from '../../item/item';
import TweetItem, {TwitterUser} from '../../item/tweet';
import {UserTimeline} from '../../states/slave_timeline';
import log from '../../log';

interface UserSlaveProps extends React.Props<any> {
    timeline: UserTimeline;
    owner: TwitterUser;
    friends: List<number>;
    dispatch: Redux.Dispatch;
}

function renderTweets(props: UserSlaveProps) {
    'use strict';

    const {timeline, owner, friends, dispatch} = props;
    const items = timeline.items;
    const focus_idx = timeline.focus_index;

    // TODO:
    // Consider mini tweet view configuration

    return items.map((item, idx) => {
        const focused = focus_idx === idx;
        if (item instanceof TweetItem) {
            return <Tweet
                status={item}
                owner={owner}
                focused={focused}
                friends={friends}
                dispatch={dispatch}
                key={idx}
            />;
        } else {
            log.error('Invalid item for slave user timeline:', item);
            return undefined;
        }
    }).toArray();
}

const UserSlave: React.StatelessComponent<UserSlaveProps> = props => (
    <div className="slave-timeline__user">
        <div className="slave-timeline__user-profile">
            <TwitterProfile
                user={props.timeline.user}
                friends={props.friends}
                size="big"
                dispatch={props.dispatch}
            />
        </div>
        {renderTweets(props)}
    </div>
);

export default UserSlave;
