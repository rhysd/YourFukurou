import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import UserSlave from './user';
import ConversationSlave from './conversation';
import {TwitterUser} from '../../item/tweet';
import State from '../../states/root';
import SlaveTimeline, {UserTimeline, ConversationTimeline} from '../../states/slave_timeline';
import log from '../../log';
import {Dispatch} from '../../store';
import {closeSlaveTimeline} from '../../actions/slave_timeline';

interface Props extends React.Props<SlaveTimelineWrapper> {
    readonly slave: SlaveTimeline;
    readonly friends: List<number>;
    readonly owner: TwitterUser;
    readonly dispatch?: Dispatch;
}

export class SlaveTimelineWrapper extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
        this.backToTimeline = this.backToTimeline.bind(this);
    }

    backToTimeline(e: React.MouseEvent) {
        e.stopPropagation();
        this.props.dispatch!(closeSlaveTimeline());
    }

    renderSlave() {
        const {slave, friends, owner, dispatch} = this.props;
        if (slave instanceof UserTimeline) {
            return <UserSlave
                timeline={slave}
                friends={friends}
                owner={owner}
                dispatch={dispatch!}
            />;
        } else if (slave instanceof ConversationTimeline) {
            return <ConversationSlave
                timeline={slave}
                friends={friends}
                owner={owner}
            />;
        } else {
            log.error('Trying rendering invalid slave timeline:', slave);
            return undefined;
        }
    }

    renderHeader() {
        return <div className="slave-timeline__header">
            <div
                className="slave-timeline__back"
                title="Back to Timeline"
                onClick={this.backToTimeline}
            >
                <i className="fa fa-angle-left fa-2x"/>
            </div>
            <div className="slave-timeline__title">{this.props.slave.getTitle()}</div>
        </div>;
    }

    render() {
        return <div className="slave-timeline__wrapper">
            <div className="slave-timeline__overlay" onClick={this.backToTimeline}/>
            <div className="slave-timeline__timeline animated slideInRight">
                {this.renderHeader()}
                {this.renderSlave()}
            </div>
        </div>;
    }
}

function select(state: State): Props {
    return {
        slave: state.slaveTimeline,
        friends: state.timeline.friend_ids,
        owner: state.timeline.user!,
    };
}

export default connect(select)(SlaveTimelineWrapper);
