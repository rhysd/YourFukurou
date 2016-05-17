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
} from '../actions';

interface TimelineProps extends React.Props<any> {
    message: MessageState;
    kind: TimelineKind,
    items: List<Item>,
    owner: TwitterUser,
    media: TweetMediaState;
    dispatch?: Redux.Dispatch;
}

function nop() {
    'use strict';
    // Note: No OPeration
}

function renderItem(idx: number, key: string, props: TimelineProps) {
    'use strict';
    const i = props.items.get(idx);
    if (i instanceof TweetItem) {
        return <Tweet
            status={i}
            timeline={props.kind}
            owner={props.owner}
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

// TODO:
// Determine the position to insert with ordered by id
const Timeline = (props: TimelineProps) => (
    <div className="timeline">
        {props.message === null ?
            undefined :
            <Message
                text={props.message.text}
                kind={props.message.kind}
                dispatch={props.dispatch}
            />}
        <ReactList
            itemRenderer={(idx, key) => renderItem(idx, key, props)}
            length={props.items.size}
            type="variable"
            threshold={500}
            useTranslate3d
        />
        {renderLightbox(props)}
    </div>
);

function select(state: State): TimelineProps {
    'use strict';
    return {
        message: state.message,
        items: state.timeline.getCurrentTimeline(),
        kind: state.timeline.kind,
        owner: state.timeline.user,
        media: state.tweetMedia,
    };
}
export default connect(select)(Timeline);
