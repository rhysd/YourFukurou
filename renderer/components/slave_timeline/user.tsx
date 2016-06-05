import * as React from 'react';
import {List} from 'immutable';
import FocusableTimeline from './focusable_timeline';
import TwitterProfile from '../tweet/profile';
import Tweet from '../tweet/index';
import Item from '../../item/item';
import TweetItem, {TwitterUser} from '../../item/tweet';
import {UserTimeline} from '../../states/slave_timeline';
import log from '../../log';
import {focusSlaveOn, blurSlaveTimeline} from '../../actions';

interface UserSlaveProps extends React.Props<any> {
    timeline: UserTimeline;
    owner: TwitterUser;
    friends: List<number>;
    dispatch: Redux.Dispatch;
}

function renderTweets(props: UserSlaveProps) {
    'use strict';

    const {timeline, owner, friends, dispatch} = props;
    const focus_idx = timeline.focus_index;

    // TODO:
    // Consider mini tweet view configuration

    return timeline.items.map((item, idx) => {
        const focused = focus_idx === idx;
        if (item instanceof TweetItem) {
            return <Tweet
                status={item}
                owner={owner}
                focused={focused}
                friends={friends}
                dispatch={dispatch}
                key={idx}
                onClick={() => dispatch(focused ? blurSlaveTimeline() : focusSlaveOn(idx))}
            />;
        } else {
            log.error('Invalid item for slave user timeline:', item);
            return undefined;
        }
    }).toArray();
}

const UserSlave: React.StatelessComponent<UserSlaveProps> = props => {
    const {timeline, friends, dispatch} = props;
    return (
        <div className="user-timeline">
            <div className="user-timeline__profile">
                <TwitterProfile
                    user={timeline.user}
                    friends={friends}
                    size="big"
                    dispatch={dispatch}
                />
            </div>
            <FocusableTimeline className="user-timeline__tweets" focusIndex={timeline.focus_index}>
                {renderTweets(props)}
            </FocusableTimeline>
        </div>
    );
};

export default UserSlave;
