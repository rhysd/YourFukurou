import * as React from 'react';
import {List} from 'immutable';
import Tweet from './tweet/index';
import Item from '../item/item';
import TweetItem from '../item/tweet';

interface TimelineProps extends React.Props<any> {
    items: List<Item>;
}

function createItem(i: Item) {
    if (i instanceof TweetItem) {
        return <Tweet status={i} key={i.id}/>;
    } else {
        log.error('Invalid item', i);
        return undefined;
    }
}

const Timeline = (props: TimelineProps) => {
    const size = props.items.size;
    // TODO:
    // Determine the position to insert with ordered by id
    return <div className="timeline">
        {props.items.map(i => createItem(i)).toArray()}
    </div>
};
export default Timeline;
