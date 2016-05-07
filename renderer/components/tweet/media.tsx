import * as React from 'react';
import {Twitter} from 'twit';

function renderThumb(entity: Twitter.MediaEntity, key: number, num_thumbs: number) {
    'use strict';

    const high_dpi = window.devicePixelRatio >= 1.5;

    const url = entity.media_url + (high_dpi ? ':medium' : ':small');
    const size = high_dpi ? entity.sizes.medium : entity.sizes.small;
    const width = size.w / window.devicePixelRatio;
    const height = size.h / window.devicePixelRatio;

    const style = {
        height: (entity.sizes.thumb.h / 2) + 'px',
    };

    return (
        <div className="tweet__media-wrapper">
            <img
                className="tweet__media-picture"
                src={url}
                width={width}
                height={height}
                alt={entity.display_url}
                style={style}
                key={key}
            />
        </div>
    );
}

interface TweetMediaProps extends React.Props<any> {
    entities: Twitter.MediaEntity[];
}

const TweetMedia = (props: TweetMediaProps) => (
    <div className="tweet__media">
        {props.entities.map((e, i) => renderThumb(e, i, props.entities.length))}
    </div>
);

export default TweetMedia;
