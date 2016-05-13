import * as React from 'react';
import {connect} from 'react-redux';
import {Twitter} from 'twit';
import {openPicturePreview} from '../../actions';

interface TweetMediaProps extends React.Props<any> {
    entities: Twitter.MediaEntity[];
    dispatch?: Redux.Dispatch;
}

function renderThumb(entity: Twitter.MediaEntity, nth: number, props: TweetMediaProps) {
    'use strict';

    const high_dpi = window.devicePixelRatio >= 1.5;

    const url = entity.media_url + (high_dpi ? ':medium' : ':small');
    const size = high_dpi ? entity.sizes.medium : entity.sizes.small;
    const width = size.w / window.devicePixelRatio;
    const height = size.h / window.devicePixelRatio;

    const style = {
        height: (entity.sizes.thumb.h / 2) + 'px',
    };

    const media_urls = props.entities.map(e => e.media_url);

    return (
        <div
            className="tweet__media-wrapper"
            onClick={() => props.dispatch(openPicturePreview(media_urls, nth))}
            key={nth}
        >
            <img
                className="tweet__media-picture"
                src={url}
                width={width}
                height={height}
                alt={entity.display_url}
                style={style}
            />
        </div>
    );
}

const TweetMedia = (props: TweetMediaProps) => (
    <div className="tweet__media">
        {props.entities.map((e, i) => renderThumb(e, i, props))}
    </div>
);

export default connect()(TweetMedia);
