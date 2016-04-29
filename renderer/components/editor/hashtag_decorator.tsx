import * as React from 'react';
import {ContentBlock} from 'draft-js';

const RE_HASHTAG = /\#\S+/g;

function hashtagStrategy(contentBlock: ContentBlock, callback: (s: number, e: number) => void) {
    'use strict';
    const text = contentBlock.getText();
    while (true) {
        const match = RE_HASHTAG.exec(text);
        if (match === null) {
            return;
        }
        const start = match.index;
        callback(start, start + match[0].length);
    }
}

interface HashtagProps extends React.Props<any> {
}
const Hashtag = (props: HashtagProps) => (
    <span className="tweet-form__hashtag">{props.children}</span>
);

export default function createHashtagDecorator() {
    'use strict';
    return {
        strategy: hashtagStrategy,
        component: Hashtag,
    };
}
