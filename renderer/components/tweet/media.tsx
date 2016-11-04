import * as React from 'react';
import {connect} from 'react-redux';
import {Twitter} from 'twit';
import {openPicturePreview} from '../../actions/tweet_media';
import {Dispatch} from '../../store';

interface TweetMediaProps extends React.Props<any> {
    readonly entities: Twitter.MediaEntity[];
    readonly dispatch?: Dispatch;
}

function renderThumb(entity: Twitter.MediaEntity, nth: number, props: TweetMediaProps) {

    const high_dpi = window.devicePixelRatio >= 1.5;

    const url = entity.media_url + (high_dpi ? ':medium' : ':small');
    const size = high_dpi ? entity.sizes.medium : entity.sizes.small;
    const width = size.w / window.devicePixelRatio;
    const height = size.h / window.devicePixelRatio;

    const style = {
        height: (entity.sizes.thumb.h / 2) + 'px',
    };

    const media_urls = props.entities.map(e => e.media_url);

    // Note:
    // 'nth' depends on the item index. So we need to prepare a callback for
    // each image item to handle click event.
    const handle_click = (e: React.MouseEvent) => {
        e.stopPropagation();
        props.dispatch!(openPicturePreview(media_urls, nth));
    };

    return (
        <div
            className="tweet__media-wrapper"
            onClick={handle_click}
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

export const TweetMedia = (props: TweetMediaProps) => (
    <div className="tweet__media">
        {props.entities.map((e, i) => renderThumb(e, i, props))}
    </div>
);

export default connect()(TweetMedia);
