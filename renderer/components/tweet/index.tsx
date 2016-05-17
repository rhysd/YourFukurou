import * as React from 'react';
import {connect} from 'react-redux';
import TweetItem, {TwitterUser} from '../../item/tweet';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';
import TweetIcon from './icon';
import State from '../../states/root';
import {TimelineKind} from '../../states/timeline';

// TODO:
// Enable to expand/contract tweet panel like as YoruFukurou
// TODO:
// Enable to focus/unfocus tweet panel like as YoruFukurou

interface TweetProps extends React.Props<any> {
    status: TweetItem;
    owner: TwitterUser;
    timeline: TimelineKind;
    focused?: boolean;
    dispatch: Redux.Dispatch;
}

function getClass(tw: TweetItem, props: TweetProps) {
    'use strict';
    if (props.focused) {
        return 'tweet__body tweet__body_focused';
    }

    if (tw.mentionsTo(props.owner) && props.timeline !== 'mention') {
        return 'tweet__body tweet__body_mention';
    }

    return 'tweet__body';
}

const Tweet: React.StatelessComponent<TweetProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <div className={getClass(tw, props)}>
            <TweetIcon user={tw.user} dispatch={props.dispatch}/>
            <TweetSecondary status={props.status} focused={props.focused}/>
            <TweetPrimary status={props.status} owner={props.owner} focused={props.focused}/>
        </div>
    );
};

export default Tweet;
