import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import UserSlave from './user';
import ConversationSlave from './conversation';
import {TwitterUser} from '../../item/tweet';
import State from '../../states/root';
import SlaveTimeline, {UserTimeline, ConversationTimeline} from '../../states/slave_timeline';
import log from '../../log';

interface SlaveTimelineProps extends React.Props<any> {
    slave: SlaveTimeline;
    friends: List<number>;
    owner: TwitterUser;
    dispatch?: Redux.Dispatch;
}

function renderSlave(props: SlaveTimelineProps) {
    const slave = props.slave;
    if (slave instanceof UserTimeline) {
        return <UserSlave
            timeline={slave}
            friends={props.friends}
            owner={props.owner}
            dispatch={props.dispatch!}
        />;
    } else if (slave instanceof ConversationTimeline) {
        return <ConversationSlave
            timeline={slave}
            friends={props.friends}
            owner={props.owner}
        />;
    } else {
        log.error('Trying rendering invalid slave timeline:', props.slave);
        return undefined;
    }
}

const SlaveTimelineComponent = (props: SlaveTimelineProps) => {
    if (props.slave === null) {
        return null;
    }

    return <div className="slave-timeline animated slideInRight">
        {renderSlave(props)}
    </div>;
};

function select(state: State): SlaveTimelineProps {
    return {
        slave: state.slaveTimeline,
        friends: state.timeline.friend_ids,
        owner: state.timeline.user!,
    };
}

// Note:
// Need to cast because type inferrance in react-redux.d.ts depends on StatelessComponent interface.
// And we can't use React.StatelessComponent<SlaveTimelineProps> for type of SlaveTimelineComponent because
// its 'props' parameter will be inferred as 'SlaveTimelineProps | undefined'.
export default connect(select)(SlaveTimelineComponent as React.StatelessComponent<SlaveTimelineProps>);
