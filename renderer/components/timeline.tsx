import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Lightbox, {LightboxImage} from 'react-images';
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
import TimelineState from '../states/timeline';
import {MessageState} from '../reducers/message';
import {TweetMediaState} from '../reducers/tweet_media';
import {
    closeTweetMedia,
    moveToNthPicturePreview,
} from '../actions';

interface TimelineProps extends React.Props<any> {
    message: MessageState;
    timeline: TimelineState;
    media: TweetMediaState;
    dispatch?: Redux.Dispatch;
}

function nop() {
    'use strict';
    // Note: Do nothing.
}

function renderItem(i: Item, id: number, props: TimelineProps) {
    'use strict';
    const key = 'item-' + id;
    if (i instanceof TweetItem) {
        return <Tweet
            status={i}
            timeline={props.timeline.kind}
            owner={props.timeline.user}
            dispatch={props.dispatch}
            key={key}
        />;
    } else if (i instanceof TimelineActivity) {
        return <TwitterActivity activity={i} key={key}/>;
    } else if (i instanceof Separator) {
        return <ZigZagSeparator key={key}/>;
    } else {
        log.error('Invalid item', key, i);
        return undefined;
    }
}

function renderLightbox(props: TimelineProps) {
    'use strict';

    if (props.media === null || props.media.picture_urls.length === 0) {
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
        props.media.picture_urls.map(e => ({ src: e }));

    const idx = props.media.index;
    const next_idx = (idx + 1) % images.length;
    const prev_idx = idx === 0 ? (images.length - 1) : (idx - 1);

    return (
        <Lightbox
            currentImage={props.media.index}
            images={images}
            isOpen
            backdropClosesModal
            width={window.innerWidth - 120}
            onClickNext={() => props.dispatch(moveToNthPicturePreview(next_idx))}
            onClickPrev={() => props.dispatch(moveToNthPicturePreview(prev_idx))}
            onClose={() => props.dispatch(closeTweetMedia())}
        />
    );
}

const Timeline = (props: TimelineProps) => {
    const items = props.timeline.getCurrentTimeline();
    const size = items.size;
    const msg = props.message;
    // TODO:
    // Determine the position to insert with ordered by id
    return <div className="timeline">
        {msg === null ?
            undefined :
            <Message text={msg.text} kind={msg.kind} dispatch={props.dispatch}/>}
        {items
            .map((i, idx) => renderItem(i, size - idx, props))
            .toArray()}
        {renderLightbox(props)}
    </div>;
};

function select(state: State): TimelineProps {
    'use strict';
    return {
        message: state.message,
        timeline: state.timeline,
        media: state.tweetMedia,
    };
}
export default connect(select)(Timeline);
