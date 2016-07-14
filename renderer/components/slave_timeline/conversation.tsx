import * as React from 'react';
import {List} from 'immutable';
import IndexAutoScroll from './index_auto_scroll';
import {ConversationTimeline} from '../../states/slave_timeline';
import Tweet from '../tweet/index';
import TweetItem, {TwitterUser} from '../../item/tweet';

interface ConversationSlaveProps extends React.Props<any> {
    readonly timeline: ConversationTimeline;
    readonly owner: TwitterUser;
    readonly friends: List<number>;
}

function renderTweets(props: ConversationSlaveProps) {
    const {timeline, owner, friends} = props;
    const focused_idx = timeline.focus_index;
    return timeline.items.map((status: TweetItem, idx: number) => (
        <Tweet
            status={status}
            owner={owner}
            friends={friends}
            focused={focused_idx === idx}
            itemIndex={idx}
            inSlaveTimeline
            key={idx}
        />
    ));
}

const ConversationSlave = (props: ConversationSlaveProps) => (
    <IndexAutoScroll
        className="conversation-timeline__tweets"
        index={props.timeline.focus_index}
    >
        {renderTweets(props)}
    </IndexAutoScroll>
);
export default ConversationSlave;
