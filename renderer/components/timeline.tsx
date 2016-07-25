import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Lightbox, {LightboxImage} from 'react-images';
import Tweet from './tweet/index';
import MiniTweet from './mini_tweet/index';
import ZigZagSeparator from './zigzag_separator';
import TwitterActivity from './activity';
import Item from '../item/item';
import TweetItem, {TwitterUser} from '../item/tweet';
import TimelineActivity from '../item/timeline_activity';
import Separator from '../item/separator';
import log from '../log';
import State from '../states/root';
import {TimelineKind} from '../states/timeline';
import TweetMediaState from '../states/tweet_media';
import {
    closeTweetMedia,
    moveToNthPicturePreview,
} from '../actions/tweet_media';
import Config from '../config';
import {Dispatch} from '../store';
import {
    AutoSizer,
    AutoSizerChild,
    CellMeasurer,
    CellMeasurerChild,
    VirtualScroll,
} from 'react-virtualized';

interface TimelineProps extends React.Props<any> {
    readonly kind: TimelineKind;
    readonly items: List<Item>;
    readonly owner: TwitterUser;
    readonly media: TweetMediaState;
    readonly focus_index: number | null;
    readonly friends: List<number>;
    readonly dispatch?: Dispatch;
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
        ret.push(s.in_reply_to_status_id!);
        if (s.in_reply_to_status === null) {
            break;
        }
        s = s.in_reply_to_status;
    }

    return ret;
}

export class Timeline extends React.Component<TimelineProps, {}> {
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

    renderItem(idx: number, key: string | number, related_ids: string[], focused_user_id: number | null) {
        const {items, focus_index, kind, owner, friends, dispatch} = this.props;
        const i = items.get(idx);
        const focused = idx === focus_index;
        if (i instanceof TweetItem) {
            const is_focused_user = focused_user_id === null ?
                false : (focused_user_id === i.getMainStatus().user.id);
            if (Config.shouldExpandTweet(focused)) {
                return <Tweet
                    status={i}
                    timeline={kind}
                    owner={owner}
                    focused={focused}
                    related={related_ids.indexOf(i.id) !== -1}
                    focusedUser={is_focused_user}
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
                    focusedUser={is_focused_user}
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
            return <ZigZagSeparator
                itemIndex={idx}
                focused={focused}
                dispatch={dispatch!}
                key={key}
            />;
        } else {
            log.error('Invalid item', key, i);
            return undefined;
        }
    }

    renderVirtualScroll() {
        const related_ids = this.getRelatedStatusIds();
        const focused_user_id = this.getFocusedUserId();
        const size = this.props.items.size;
        return (
            <AutoSizer>
                {(({height, width}) => (
                    <CellMeasurer
                        cellRenderer={({rowIndex}) => this.renderItem(rowIndex, rowIndex, related_ids, focused_user_id)}
                        columnCount={1}
                        rowCount={size}
                    >
                        {(({getRowHeight}) => (
                            <VirtualScroll
                                width={width}
                                height={height}
                                rowCount={size}
                                rowHeight={getRowHeight}
                                rowRenderer={({index}) => this.renderItem(index, index, related_ids, focused_user_id)}
                            />
                        )) as CellMeasurerChild}
                    </CellMeasurer>
                )) as AutoSizerChild}
            </AutoSizer>
        );
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
                onClickNext={() => dispatch!(moveToNthPicturePreview(next_idx))}
                onClickPrev={() => dispatch!(moveToNthPicturePreview(prev_idx))}
                onClose={() => dispatch!(closeTweetMedia())}
                enableKeyboardInput={true}
            />
        );
    }

    componentWillReceiveProps(next: TimelineProps) {
        // Note:
        // When we should manage visible range of timline, we can notify the range to store
        // by dispatching action with the result of `this.refs.list.getVisibleRange()`.
        if (next.focus_index !== this.props.focus_index && next.focus_index !== null) {
            log.debug('Focus moves to:', next.focus_index);
            /* XXX
            this.refs.list.scrollAround(next.focus_index);
            */
        }
    }

    // TODO:
    // Determine the position to insert with ordered by id
    // TODO:
    // When 'expand_tweet' == 'never' or 'expand_tweet' == 'focused' and focus == null,
    // we can know all elements' height.  Scrolling can be optimized.
    render() {
        return (
            <div className="timeline">
                {this.renderVirtualScroll()}
                {this.renderLightbox()}
            </div>
        );
    }
}

function select(state: State): TimelineProps {
    return {
        items: state.timeline.getCurrentTimeline(),
        kind: state.timeline.kind,
        owner: state.timeline.user!,
        media: state.tweetMedia,
        focus_index: state.timeline.focus_index,
        friends: state.timeline.friend_ids,
    };
}
export default connect(select)(Timeline);
