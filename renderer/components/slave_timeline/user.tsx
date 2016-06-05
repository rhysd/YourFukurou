import * as React from 'react';
import {List} from 'immutable';
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
    tweets_root: HTMLElement;

    scrollTweetIntoView(index: number) {
        if (!this.tweets_root) {
            log.error('Ref to root element of tweets is invalid:', this.tweets_root);
            return;
        }

        const tweets = this.tweets_root.children;
        const tweet = tweets.item(index);
        if (!tweet) {
            log.error('Invalid index to scroll into view:', index, tweet);
            return;
        }

        tweet.scrollIntoView({behavior: 'smooth'});
    }

    renderTweets() {
        const {timeline, owner, friends, dispatch} = this.props;
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
                    dispatch={dispatch}
                    key={idx}
                    onClick={() => dispatch(focused ? blurSlaveTimeline() : focusSlaveOn(idx))}
                />;
            } else {
                log.error('Invalid item for slave user timeline:', item);
                return undefined;
            }
        }).toArray();
    }

    componentDidUpdate() {
        const idx = this.props.timeline.focus_index;
        if (idx !== null) {
            this.scrollTweetIntoView(idx);
        }
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
                <div className="user-timeline__tweets" ref={r => { this.tweets_root = r; }}>
                    {this.renderTweets()}
                </div>
            </div>
        );
    }
}
