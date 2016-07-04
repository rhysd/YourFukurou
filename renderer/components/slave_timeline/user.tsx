import * as React from 'react';
import {List} from 'immutable';
import IndexAutoScroll from './index_auto_scroll';
import TwitterProfile from '../tweet/profile';
import Tweet from '../tweet/index';
import ZigZagSeparator from '../zigzag_separator';
import Item from '../../item/item';
import TweetItem, {TwitterUser} from '../../item/tweet';
import Separator from '../../item/separator';
import {UserTimeline} from '../../states/slave_timeline';
import log from '../../log';
import {appendPastItems} from '../../actions';
import TwitterRestApi from '../../twitter/rest_api';

interface UserSlaveProps extends React.Props<UserSlave> {
    timeline: UserTimeline;
    owner: TwitterUser;
    friends: List<number>;
    dispatch: Redux.Dispatch;
}

export default class UserSlave extends React.Component<UserSlaveProps, {}> {
    constructor(props: UserSlaveProps) {
        super(props);
        this.onSeparatorClicked = this.onSeparatorClicked.bind(this);
    }

    onSeparatorClicked(e: React.MouseEvent) {
        e.stopPropagation();
        const timeline = this.props.timeline;
        const items = timeline.items;
        const size = items.size;
        if (size <= 1) {
            return;
        }
        const last_item = items.get(size - 2);
        const user_id = timeline.user.id;
        if (last_item instanceof TweetItem) {
            TwitterRestApi.userTimeline(user_id, {
                max_id: last_item.id,
                count: 200,
            }).then(statuses => {
                if (statuses.length === 0) {
                    return [] as Item[];
                }
                if (statuses[0].id_str === last_item.id) {
                    statuses = statuses.slice(1);
                }
                const items: Item[] = statuses.map(s => new TweetItem(s));
                items.push(new Separator());
                return items;
            }).then(items => this.props.dispatch(appendPastItems(user_id, items)));
        } else {
            log.error('Last item of user timeline must be tweet but actually:', last_item);
        }
    }

    renderTweets() {
        const {timeline, owner, friends} = this.props;
        const focus_idx = timeline.focus_index;

        // TODO:
        // Consider mini tweet view configuration

        return timeline.items.map((item, idx) => {
            const focused = focus_idx === idx;
            if (item instanceof TweetItem) {
                return <Tweet
                    status={item}
                    owner={owner}
                    focused={focused}
                    friends={friends}
                    itemIndex={idx}
                    key={idx}
                />;
            } else if (item instanceof Separator) {
                return <ZigZagSeparator
                    focused={focused}
                    onClick={this.onSeparatorClicked}
                    key={idx}
                />;
            } else {
                log.error('Invalid item for slave user timeline:', item);
                return undefined;
            }
        }).toArray();
    }

    render() {
        const {timeline, friends} = this.props;
        return (
            <div className="user-timeline">
                <div className="user-timeline__profile">
                    <TwitterProfile
                        user={timeline.user}
                        friends={friends}
                        size="big"
                    />
                </div>
                <IndexAutoScroll className="user-timeline__tweets" index={timeline.focus_index}>
                    {this.renderTweets()}
                </IndexAutoScroll>
            </div>
        );
    }
}

