import * as React from 'react';
import {List} from 'immutable';
import Tweet from './tweet/index';

interface TimelineProps extends React.Props<any> {
    tweets: List<TweetStatus>;
}

const Timeline = (props: TimelineProps) => {
    const size = props.tweets.size;
    // Note:
    // Use `size - idx` to give persistent keys to corresponding tweets
    return <div className="timeline">
        {props.tweets.map((tw, idx) => <Tweet status={tw} key={size - idx}/>).toArray()}
    </div>
};
export default Timeline;
