import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Lightbox, {LightboxImage} from 'react-images';
import * as ReactList from 'react-list';
import Tweet from './tweet/index';
import MiniTweet from './mini_tweet/index';
import ZigZagSeparator from './zigzag_separator';
import TwitterActivity from './activity';
import Message from './message';
import Item from '../item/item';
import TweetItem, {TwitterUser} from '../item/tweet';
import TimelineActivity from '../item/timeline_activity';
import Separator from '../item/separator';
import log from '../log';
import State from '../states/root';
import {TimelineKind} from '../states/timeline';
import TweetMediaState from '../states/tweet_media';
import {MessageState} from '../reducers/message';
import {
    closeTweetMedia,
    moveToNthPicturePreview,
    closeSlaveTimeline,
} from '../actions';
import Config from '../config';

interface TimelineProps extends React.Props<any> {
    message: MessageState;
    kind: TimelineKind;
    items: List<Item>;
    owner: TwitterUser;
    media: TweetMediaState;
    focus_index: number;
    friends: List<number>;
    overlay: boolean;
    dispatch?: Redux.Dispatch;
}

function nop() {
    // Note: No OPeration
}

const NoImage: string[] = [];

function getStatusIdsRelatedTo(status: TweetItem): string[] {
    if (status.related_statuses.length === 0) {
        return [];
    }
    const ret = status.related_statuses.map(s => s.id);
    const push = Array.prototype.push;
    for (const s of status.related_statuses) {
        push.apply(ret, getStatusIdsRelatedTo(s));
    }

    let s = status;
    while (s.in_reply_to_status_id !== null) {
        ret.push(status.in_reply_to_status_id);
        if (s.in_reply_to_status === null) {
            break;
        }
        s = s.in_reply_to_status;
    }

    return ret;
}

class Timeline extends React.Component<TimelineProps, {}> {
    refs: {
        list: ReactList.Node;
        [key: string]: React.Component<any, any> | Element;
    };

    getFocusedUserId() {
        const {focus_index, items} = this.props;
        if (focus_index === null) {
            return null;
        }

        const item = items.get(focus_index);
        if (item instanceof TweetItem) {
            return item.getMainStatus().user.id;
        } else {
            return null;
        }
    }

    getRelatedStatusIds() {
        const {focus_index, items} = this.props;
        if (focus_index === null) {
            return [];
        }

        const item = items.get(focus_index);
        if (item instanceof TweetItem) {
            return getStatusIdsRelatedTo(item);
        } else {
            return [];
        }
    }

    renderItem(idx: number, key: string, related_ids: string[], focused_user_id: number) {
        const {items, focus_index, kind, owner, friends} = this.props;
        const i = items.get(idx);
        const focused = idx === focus_index;
        if (i instanceof TweetItem) {
            if (Config.shouldExpandTweet(focused)) {
                return <Tweet
                    status={i}
                    timeline={kind}
                    owner={owner}
                    focused={focused}
                    related={related_ids.indexOf(i.id) !== -1}
                    focused_user={focused_user_id === i.getMainStatus().user.id}
                    friends={friends}
                    itemIndex={idx}
                    key={key}
                />;
            } else {
                return <MiniTweet
                    status={i}
                    timeline={kind}
                    owner={owner}
                    focused={focused}
                    related={related_ids.indexOf(i.id) !== -1}
                    focused_user={focused_user_id === i.getMainStatus().user.id}
                    itemIndex={idx}
                    key={key}
                />;
            }
        } else if (i instanceof TimelineActivity) {
            return <TwitterActivity
                activity={i}
                focused={focused}
                collapsed={!Config.shouldExpandTweet(focused)}
                itemIndex={idx}
                key={key}
            />;
        } else if (i instanceof Separator) {
            return <ZigZagSeparator focused={focused} key={key}/>;
        } else {
            log.error('Invalid item', key, i);
            return undefined;
        }
    }

    renderLightbox() {
        const {media, dispatch} = this.props;

        if (!media.is_open || media.picture_urls.length === 0) {
            return <Lightbox
                images={NoImage}
                isOpen={false}
                onClickNext={nop}
                onClickPrev={nop}
                onClose={nop}
                enableKeyboardInput={false}
            />;
        }

        // TODO:
        // Currently only type: photo is supported.

        // TODO:
        // Consider to make 'srcset' property from 'sizes' property in an entity.
        const images: LightboxImage[] =
            media.picture_urls.map(e => ({ src: e }));

        const idx = media.index;
        const next_idx = (idx + 1) % images.length;
        const prev_idx = idx === 0 ? (images.length - 1) : (idx - 1);

        return (
            <Lightbox
                currentImage={media.index}
                images={images}
                isOpen
                backdropClosesModal
                width={window.innerWidth - 120}
                onClickNext={() => dispatch(moveToNthPicturePreview(next_idx))}
                onClickPrev={() => dispatch(moveToNthPicturePreview(prev_idx))}
                onClose={() => dispatch(closeTweetMedia())}
                enableKeyboardInput={true}
            />
        );
    }

    onOverlayClicked(e: React.MouseEvent) {
        e.stopPropagation();
        this.props.dispatch(closeSlaveTimeline());
    }

    renderOverlay() {
        if (!this.props.overlay) {
            return undefined;
        }
        return <div className="timeline__overlay" onClick={this.onOverlayClicked.bind(this)}/>;
    }

    componentWillReceiveProps(next: TimelineProps) {
        // Note:
        // When we should manage visible range of timline, we can notify the range to store
        // by dispatching action with the result of `this.refs.list.getVisibleRange()`.
        if (next.focus_index !== this.props.focus_index && next.focus_index !== null) {
            log.debug('Focus moves to:', next.focus_index);
            this.refs.list.scrollAround(next.focus_index);
        }
    }

    // TODO:
    // Determine the position to insert with ordered by id
    // TODO:
    // When 'expand_tweet' == 'never' or 'expand_tweet' == 'focused' and focus == null,
    // we can know all elements' height.  Scrolling can be optimized.
    render() {
        const {message, dispatch, items, focus_index, overlay} = this.props;
        const related_ids = this.getRelatedStatusIds();
        const focused_user_id = this.getFocusedUserId();
        const style = {
            overflowY: overlay ? 'visible' : undefined
        };
        return (
            <div className="timeline" style={style}>
                {message === null ?
                    undefined :
                    <Message
                        text={message.text}
                        kind={message.kind}
                        dispatch={dispatch}
                    />}
                <ReactList
                    itemRenderer={(idx, key) => this.renderItem(idx, key, related_ids, focused_user_id)}
                    length={items.size}
                    type="variable"
                    threshold={500}
                    useTranslate3d
                    ref="list"
                />
                {this.renderLightbox()}
                {this.renderOverlay()}
            </div>
        );
    }
}

function select(state: State): TimelineProps {
    return {
        message: state.message,
        items: state.timeline.getCurrentTimeline(),
        kind: state.timeline.kind,
        owner: state.timeline.user,
        media: state.tweetMedia,
        focus_index: state.timeline.focus_index,
        friends: state.timeline.friend_ids,
        overlay: state.slaveTimeline !== null,
    };
}
export default connect(select)(Timeline);
