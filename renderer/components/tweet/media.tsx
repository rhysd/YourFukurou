import * as React from 'react';
import {Twitter} from 'twit';

function renderPicture(entity: Twitter.MediaEntity, key: number) {
    'use strict';
    return <div className="tweet__media-picture" key={key}>
    </div>;
}

interface TweetMediaProps extends React.Props<any> {
    entities: Twitter.MediaEntity[];
}

const TweetMedia = (props: TweetMediaProps) => (
    <div className="tweet__media">
        {props.entities.map((e, i) => renderPicture(e, i))}
    </div>
);

export default TweetMedia;
