import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import TweetItem, {TwitterUser} from '../../item/tweet';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';
import PopupIcon from './popup_icon';
import UndraggableClickable from '../undraggable_clickable';
import State from '../../states/root';
import {TimelineKind} from '../../states/timeline';

// TODO:
// Enable to expand/contract tweet panel like as YoruFukurou
// TODO:
// Enable to focus/unfocus tweet panel like as YoruFukurou

interface TweetProps extends React.Props<any> {
    status: TweetItem;
    owner: TwitterUser;
    timeline?: TimelineKind;
    focused?: boolean;
    related?: boolean;
    focused_user?: boolean;
    friends?: List<number>;
    onClick?: (e: React.MouseEvent) => void;
}

function getClass(tw: TweetItem, props: TweetProps) {
    'use strict';
    if (props.focused) {
        return 'tweet__body tweet__body_focused';
    }

    const timeline = props.timeline || 'home';
    if (tw.mentionsTo(props.owner) && timeline !== 'mention') {
        return 'tweet__body tweet__body_mention';
    }

    if (props.related) {
        return 'tweet__body tweet__body_related';
    }

    if (props.focused_user) {
        return 'tweet__body tweet__body_user-related';
    }

    return 'tweet__body';
}

const Tweet: React.StatelessComponent<TweetProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <UndraggableClickable
            className={getClass(tw, props)}
            onClick={props.onClick}
        >
            <PopupIcon user={tw.user} friends={props.friends}/>
            <TweetSecondary status={props.status} focused={props.focused}/>
            <TweetPrimary status={props.status} owner={props.owner} focused={props.focused}/>
        </UndraggableClickable>
    );
};

export default Tweet;
