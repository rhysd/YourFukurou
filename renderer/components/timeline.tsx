import * as React from 'react';
import {List} from 'immutable';
import Tweet from './tweet/index';

interface TimelineProps extends React.Props<any> {
    tweets: List<TweetStatus>;
}

const Timeline = (props: TimelineProps) => (
    <div className="timeline">
        {props.tweets.map((tw, idx) => <Tweet status={tw} key={idx}/>).toArray()}
    </div>
);
export default Timeline;
