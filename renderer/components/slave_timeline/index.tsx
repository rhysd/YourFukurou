import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import UserSlave from './user';
import State from '../../states/root';
import SlaveTimeline, {UserTimeline} from '../../states/slave_timeline';
import log from '../../log';

interface SlaveTimelineProps extends React.Props<any> {
    slave: SlaveTimeline;
    friends: List<number>;
    dispatch?: Redux.Dispatch;
}

function renderSlave(props: SlaveTimelineProps) {
    'use strict';
    const slave = props.slave;
    if (slave instanceof UserTimeline) {
        return <UserSlave
            timeline={slave}
            friends={props.friends}
            dispatch={props.dispatch}
        />;
    } else {
        log.error('Trying rendering invalid slave timeline:', props.slave);
        return undefined;
    }
}

const SlaveTimelineComponent: React.StatelessComponent<SlaveTimelineProps> = props => {
    if (props.slave === null) {
        return null;
    }

    return <div className="slave-timeline animated slideInRight">
        {renderSlave(props)}
    </div>;
};

function select(state: State): SlaveTimelineProps {
    'use strict';
    return {
        slave: state.slaveTimeline,
        friends: state.timeline.friend_ids,
    };
}

export default connect(select)(SlaveTimelineComponent);
