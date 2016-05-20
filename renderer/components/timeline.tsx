import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Lightbox, {LightboxImage} from 'react-images';
import * as ReactList from 'react-list';
import Tweet from './tweet/index';
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
import {MessageState} from '../reducers/message';
import {TweetMediaState} from '../reducers/tweet_media';
import {
    closeTweetMedia,
    moveToNthPicturePreview,
    focusOnItem,
    unfocusItem,
} from '../actions';

interface TimelineProps extends React.Props<any> {
    message: MessageState;
    kind: TimelineKind,
    items: List<Item>,
    owner: TwitterUser,
    media: TweetMediaState;
    focus_index: number;
    friends: List<number>;
    dispatch?: Redux.Dispatch;
}

function nop() {
    'use strict';
    // Note: No OPeration
}

class Timeline extends React.Component<TimelineProps, {}> {
    refs: {
        list: ReactList.Node;
        [key: string]: React.Component<any, any> | Element;
    }

    toggleFocus(focused: boolean, idx: number) {
        const action = focused ?
            unfocusItem() : focusOnItem(idx);
        this.props.dispatch(action);
    }

    renderItem(idx: number, key: string) {
        const {items, focus_index, kind, owner, friends, dispatch} = this.props;
        const i = items.get(idx);
        const focused = idx === focus_index;
        const click_handler = () => this.toggleFocus(focused, idx);
        if (i instanceof TweetItem) {
            return <Tweet
                status={i}
                timeline={kind}
                owner={owner}
                focused={focused}
                friends={friends}
                onClick={click_handler}
                dispatch={dispatch}
                key={key}
            />;
        } else if (i instanceof TimelineActivity) {
            return <TwitterActivity
                activity={i}
                focused={focused}
                onClick={click_handler}
                key={key}
            />;
        } else if (i instanceof Separator) {
            return <ZigZagSeparator key={key}/>;
        } else {
            log.error('Invalid item', key, i);
            return undefined;
        }
    }

    renderLightbox() {
        const {media, dispatch} = this.props;

        if (media === null || media.picture_urls.length === 0) {
            return <Lightbox
                images={[]}
                isOpen={false}
                onClickNext={nop}
                onClickPrev={nop}
                onClose={nop}
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
            />
        );
    }

    componentWillReceiveProps(next: TimelineProps) {
        if (next.focus_index !== this.props.focus_index && next.focus_index !== null) {
            log.debug('Focus moves to:', next.focus_index);
            this.refs.list.scrollAround(next.focus_index);
        }
    }

    // TODO:
    // Determine the position to insert with ordered by id
    render() {
        const {message, dispatch, items} = this.props;
        return (
            <div className="timeline">
                {message === null ?
                    undefined :
                    <Message
                        text={message.text}
                        kind={message.kind}
                        dispatch={dispatch}
                    />}
                <ReactList
                    itemRenderer={(idx, key) => this.renderItem(idx, key)}
                    length={items.size}
                    type="variable"
                    threshold={500}
                    useTranslate3d
                    ref="list"
                />
                {this.renderLightbox()}
            </div>
        );
    }
}

function select(state: State): TimelineProps {
    'use strict';
    return {
        message: state.message,
        items: state.timeline.getCurrentTimeline(),
        kind: state.timeline.kind,
        owner: state.timeline.user,
        media: state.tweetMedia,
        focus_index: state.timeline.focus_index,
        friends: state.timeline.friend_ids,
    };
}
export default connect(select)(Timeline);
