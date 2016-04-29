import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Tweet from './tweet/index';
import Message from './message';
import ZigZagSeparator from './zigzag_separator';
import Item from '../item/item';
import TweetItem from '../item/tweet';
import Separator from '../item/separator';
import log from '../log';
import State from '../reducers/state';

interface TimelineProps extends React.Props<any> {
    message: MessageInfo;
    items: List<Item>;
    dispatch?: Redux.Dispatch;
}

function renderItem(i: Item, id: number) {
    'use strict';
    const key = 'item-' + id;
    if (i instanceof TweetItem) {
        return <Tweet status={i} key={key}/>;
    } else if (i instanceof Separator) {
        return <ZigZagSeparator key={key}/>;
    } else {
        log.error('Invalid item', key, i);
        return undefined;
    }
}

const Timeline = (props: TimelineProps) => {
    const size = props.items.size;
    const msg = props.message;
    // TODO:
    // Determine the position to insert with ordered by id
    return <div className="timeline">
        {msg === null ?
            undefined :
            <Message text={msg.text} kind={msg.kind} dispatch={props.dispatch}/>}
        {props.items
            .map((i, idx) => renderItem(i, size - idx))
            .toArray()}
    </div>
};

function select(state: State): TimelineProps {
    return {
        message: state.timeline.current_message,
        items: state.timeline.current_items,
    };
}
export default connect(select)(Timeline);
