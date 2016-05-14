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
    dispatch: Redux.Dispatch;
}

function getClass(tw: TweetItem, owner: TwitterUser, timeline: TimelineKind) {
    'use strict';
    // Note:
    // Change mention's color in except for mention timeline
    return tw.mentionsTo(owner) && timeline !== 'mention' ?
        'tweet__body tweet__body_mention' :
        'tweet__body';
}

const Tweet: React.StatelessComponent<TweetProps> = props => {
    const tw = props.status.getMainStatus();
    return (
        <div className={getClass(tw, props.owner, props.timeline)}>
            <TweetIcon user={tw.user} dispatch={props.dispatch}/>
            <TweetSecondary status={props.status}/>
            <TweetPrimary status={props.status} owner={props.owner}/>
        </div>
    );
};

export default Tweet;
