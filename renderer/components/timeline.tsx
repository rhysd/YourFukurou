import * as React from 'react';
import {List} from 'immutable';
import Tweet from './tweet/index';
import Message from './message';
import ZigZagSeparator from './zigzag_separator';
import Item from '../item/item';
import TweetItem from '../item/tweet';
import Separator from '../item/separator';

interface TimelineProps extends React.Props<any> {
    message: MessageInfo;
    items: List<Item>;
}

function renderItem(i: Item, id: number) {
    const key = 'item-' + id;
    if (i instanceof TweetItem) {
        return <Tweet status={i} key={key}/>;
    } else if (i instanceof Separator) {
        return <ZigZagSeparator key={key}/>;
    } else {
        log.error('Invalid item', key);
        return undefined;
    }
}

function renderMessage(msg: MessageInfo) {
    if (msg === null) {
        return undefined;
    }
    return <Message text={msg.text} kind={msg.kind}/>;
}

const Timeline = (props: TimelineProps) => {
    const size = props.items.size;
    // TODO:
    // Determine the position to insert with ordered by id
    return <div className="timeline">
        {renderMessage(props.message)}
        {props.items.map((i, idx) => renderItem(i, size - idx)).toArray()}
    </div>
};
export default Timeline;
