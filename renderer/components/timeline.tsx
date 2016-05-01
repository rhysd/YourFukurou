import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Tweet from './tweet/index';
import Message from './message';
import ZigZagSeparator from './zigzag_separator';
import Item from '../item/item';
import TweetItem, {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import log from '../log';
import State from '../states/root';
import {MessageState} from '../reducers/message';

interface TimelineProps extends React.Props<any> {
    message: MessageState;
    items: List<Item>;
    user: TwitterUser;
    dispatch?: Redux.Dispatch;
}

function renderItem(i: Item, id: number, props: TimelineProps) {
    'use strict';
    const key = 'item-' + id;
    if (i instanceof TweetItem) {
        return <Tweet status={i} user={props.user} key={key}/>;
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
            .map((i, idx) => renderItem(i, size - idx, props))
            .toArray()}
    </div>;
};

function select(state: State): TimelineProps {
    'use strict';
    return {
        message: state.message,
        items: state.timeline.getCurrentTimeline(),
        user: state.timeline.user,
    };
}
export default connect(select)(Timeline);
