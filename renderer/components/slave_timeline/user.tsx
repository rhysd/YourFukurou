import * as React from 'react';
import {List} from 'immutable';
import * as ReactList from 'react-list';
import TwitterProfile from '../tweet/profile';
import Tweet from '../tweet/index';
import Item from '../../item/item';
import TweetItem, {TwitterUser} from '../../item/tweet';
import {UserTimeline} from '../../states/slave_timeline';
import log from '../../log';
import {focusSlaveOn, blurSlaveTimeline} from '../../actions';

interface UserSlaveProps extends React.Props<UserSlave> {
    timeline: UserTimeline;
    owner: TwitterUser;
    friends: List<number>;
    dispatch: Redux.Dispatch;
}

export default class UserSlave extends React.Component<UserSlaveProps, {}> {
    refs: {
        list: ReactList.Node;
        [key: string]: React.Component<any, any> | Element;
    };
    renderTweet: (idx: number, key: string) => JSX.Element;

    constructor(props: UserSlaveProps) {
        super(props);
        this.renderTweet = this.renderTweet_.bind(this);
    }

    renderTweet_(idx: number, key: string) {
        const {timeline, owner, friends, dispatch} = this.props;
        const focus_idx = timeline.focus_index;

        // TODO:
        // Consider mini tweet view configuration

        const item = timeline.items.get(idx);
        const focused = focus_idx === idx;
        console.log('RENDER ITEM:', item, focused);
        if (item instanceof TweetItem) {
            return (
                <Tweet
                    status={item}
                    owner={owner}
                    focused={focused}
                    friends={friends}
                    dispatch={dispatch}
                    key={key}
                    onClick={() => dispatch(focused ? blurSlaveTimeline() : focusSlaveOn(idx))}
                />
            );
        } else {
            log.error('Invalid item for slave user timeline:', item);
            return undefined;
        }
    }

    componentWillReceiveProps(next: UserSlaveProps) {
        // Note:
        // When we should manage visible range of timline, we can notify the range to store
        // by dispatching action with the result of `this.refs.list.getVisibleRange()`.
        const idx = next.timeline.focus_index;
        if (idx !== this.props.timeline.focus_index && idx !== null) {
            log.debug('Focus moves to:', idx);
            this.refs.list.scrollAround(idx);

            // XXX:
            // This needs to notify item's focus update to <ReactList>.
            // When renderTweet is changed, the prop change will update <ReactList> hence its
            // element is updated properly.
            // Otherwise, <ReactList> can't know that some item will update or not and NEVER
            // updates its items.
            this.renderTweet = this.renderTweet_.bind(this);
        }
        console.log('FOCUS:', this.props.timeline.focus_index, '->', idx);
    }

    render() {
        const {timeline, friends, dispatch} = this.props;
        return (
            <div className="user-timeline">
                <div className="user-timeline__profile">
                    <TwitterProfile
                        user={timeline.user}
                        friends={friends}
                        size="big"
                        dispatch={dispatch}
                    />
                </div>
                <div className="user-timeline__tweets">
                    <ReactList
                        type="variable"
                        itemRenderer={this.renderTweet}
                        length={timeline.items.size}
                        useTranslate3d
                        ref="list"
                    />
                </div>
            </div>
        );
    }
}
