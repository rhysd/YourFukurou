import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import UserSlave from './user';
import ConversationSlave from './conversation';
import {TwitterUser} from '../../item/tweet';
import State from '../../states/root';
import SlaveTimelineState, {
    SlaveTimeline,
    UserTimeline,
    ConversationTimeline,
} from '../../states/slave_timeline';
import log from '../../log';
import {Dispatch} from '../../store';
import {closeSlaveTimeline, backSlaveTimeline} from '../../actions/slave_timeline';

interface Props extends React.Props<SlaveTimelineWrapper> {
    readonly slave: SlaveTimelineState;
    readonly friends: List<number>;
    readonly owner: TwitterUser;
    readonly dispatch?: Dispatch;
}

export class SlaveTimelineWrapper extends React.Component<Props, {}> {
    timeline_node: HTMLElement;

    onTimelineNodeRef = (ref: HTMLElement) => {
        this.timeline_node = ref;
    }

    constructor(props: Props) {
        super(props);
        this.back = this.back.bind(this);
        this.close = this.close.bind(this);
    }

    back(e: React.MouseEvent) {
        e.stopPropagation();
        if (this.props.slave.timeline_stack.size <= 1) {
            this.props.dispatch!(closeSlaveTimeline());
        } else {
            this.props.dispatch!(backSlaveTimeline());
        }
    }

    close(e: React.MouseEvent) {
        e.stopPropagation();
        this.props.dispatch!(closeSlaveTimeline());
    }

    renderSlave(timeline: SlaveTimeline) {
        const {friends, owner, dispatch} = this.props;
        if (timeline instanceof UserTimeline) {
            return <UserSlave
                timeline={timeline}
                friends={friends}
                owner={owner}
                dispatch={dispatch!}
            />;
        } else if (timeline instanceof ConversationTimeline) {
            return <ConversationSlave
                timeline={timeline}
                friends={friends}
                owner={owner}
            />;
        } else {
            log.error('Trying rendering invalid slave timeline:', timeline);
            return undefined;
        }
    }

    renderHeader(timeline: SlaveTimeline) {
        const slave = this.props.slave;
        const back_message =
            slave.timeline_stack.size <= 1 ?
                'Back to Timeline' :
                slave.timeline_stack.get(-2).getTitle();
        return <div className="slave-timeline__header">
            <div
                className="slave-timeline__back"
                title={back_message}
                onClick={this.back}
            >
                <i className="fa fa-angle-left fa-2x"/>
            </div>
            <div className="slave-timeline__title">{timeline.getTitle()}</div>
        </div>;
    }

    animate(kind: string) {
        if (!this.timeline_node) {
            return;
        }
        let listener: () => void;
        listener = () => {
            this.timeline_node.className = 'slave-timeline__timeline';
            this.timeline_node.removeEventListener('animationend', listener);
        };
        this.timeline_node.addEventListener('animationend', listener);
        this.timeline_node.className = 'slave-timeline__timeline animated ' + kind;
    }

    componentDidMount() {
        this.animate('slideInRight');
    }

    // XXX:
    // Use requestIdleCallback to delay animation after DOM rendering finishes.
    // It avoids to mix animation and DOM update.
    componentDidUpdate(prev: Props) {
        const current_size = this.props.slave.timeline_stack.size;
        const prev_size = prev.slave.timeline_stack.size;
        if (current_size > prev_size) {
            window.requestIdleCallback(() => this.animate('slideInRight'));
        } else if (current_size < prev_size && current_size !== 0) {
            window.requestIdleCallback(() => this.animate('slideOutRight'));
        }
    }

    render() {
        // Note:
        // Current timeline must exist because renderer of this component already checked it.
        const timeline = this.props.slave.getCurrent()!;
        return <div className="slave-timeline__wrapper">
            <div className="slave-timeline__overlay" onClick={this.close}/>
            <div
                className="slave-timeline__timeline"
                ref={this.onTimelineNodeRef}
            >
                {this.renderHeader(timeline)}
                {this.renderSlave(timeline)}
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
