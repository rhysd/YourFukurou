import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import Lightbox = require('react-images');
import Tweet from './tweet/index';
import Message from './message';
import ZigZagSeparator from './zigzag_separator';
import Item from '../item/item';
import TweetItem, {TwitterUser} from '../item/tweet';
import Separator from '../item/separator';
import log from '../log';
import State from '../states/root';
import {MessageState} from '../reducers/message';
import {TweetMediaState} from '../reducers/tweet_media';
import {
    closeTweetMedia,
    moveToNthTweetMedia,
} from '../actions';

interface TimelineProps extends React.Props<any> {
    message: MessageState;
    items: List<Item>;
    user: TwitterUser;
    media: TweetMediaState;
    dispatch?: Redux.Dispatch;
}

function renderItem(i: Item, id: number, props: TimelineProps) {
    'use strict';
    const key = 'item-' + id;
    if (i instanceof TweetItem) {
        return <Tweet status={i} user={props.user} key={key}/>;
    } else if (i instanceof Separator) {
        return <ZigZagSeparator key={key}/>;
    } else {
        log.error('Invalid item', key, i);
        return undefined;
    }
}

function renderLightbox(props: TimelineProps) {
    'use strict';

    if (props.media === null) {
        return undefined;
    }

    // TODO:
    // Currently only type: photo is supported.

    // TODO:
    // Make 'srcset' property from 'sizes' property in an entity.
    const images: ReactImages.LightboxImage[] = props.media.entities.map(e => ({
        src: e.media_url,
    }));

    const idx = props.media.index;
    const next_idx = (idx + 1) % images.length;
    const prev_idx = idx === 0 ? (images.length - 1) : (idx - 1);

    return (
        <Lightbox
            currentImage={props.media.index}
            images={images}
            isOpen={images.length > 0}
            onClickNext={() => props.dispatch(moveToNthTweetMedia(next_idx))}
            onClickPrev={() => props.dispatch(moveToNthTweetMedia(prev_idx))}
            onClose={() => props.dispatch(closeTweetMedia())}
        />
    );
}

const Timeline = (props: TimelineProps) => {
    const size = props.items.size;
    const msg = props.message;
    // TODO:
    // Determine the position to insert with ordered by id
    return <div className="timeline">
        {msg === null ?
            undefined :
            <Message text={msg.text} kind={msg.kind} dispatch={props.dispatch}/>}
        {props.items
            .map((i, idx) => renderItem(i, size - idx, props))
            .toArray()}
        {renderLightbox(props)}
    </div>;
};

function select(state: State): TimelineProps {
    'use strict';
    return {
        message: state.message,
        items: state.timeline.getCurrentTimeline(),
        user: state.timeline.user,
        media: state.tweetMedia,
    };
}
export default connect(select)(Timeline);
