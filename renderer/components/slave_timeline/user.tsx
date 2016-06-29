import * as React from 'react';
import {List} from 'immutable';
import IndexAutoScroll from './index_auto_scroll';
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
}

function renderTweets(props: UserSlaveProps) {

    const {timeline, owner, friends} = props;
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
                itemIndex={idx}
                key={idx}
            />;
        } else {
            log.error('Invalid item for slave user timeline:', item);
            return undefined;
        }
    }).toArray();
}

const UserSlave: React.StatelessComponent<UserSlaveProps> = props => {
    const {timeline, friends} = props;
    return (
        <div className="user-timeline">
            <div className="user-timeline__profile">
                <TwitterProfile
                    user={timeline.user}
                    friends={friends}
                    size="big"
                />
            </div>
            <IndexAutoScroll className="user-timeline__tweets" index={timeline.focus_index}>
                {renderTweets(props)}
            </IndexAutoScroll>
        </div>
    );
};

export default UserSlave;
