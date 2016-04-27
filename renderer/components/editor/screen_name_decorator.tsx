import * as React from 'react';
import {ContentBlock} from 'draft-js';

const RE_SCREEN_NAME = /@\w+/g;

function screenNameStrategy(contentBlock: ContentBlock, callback: (s: number, e: number) => void) {
    'use strict';
    const text = contentBlock.getText();
    while (true) {
        const match = RE_SCREEN_NAME.exec(text);
        if (match === null) {
            return;
        }
        const start = match.index;
        callback(start, start + match[0].length);
    }
}

interface ScreenNameProps extends React.Props<any> {
}
const ScreenName = (props: ScreenNameProps) => (
    <span className="tweet-form__screen-name">{props.children}</span>
);

export default function createScreenNameDecorator() {
    return {
        strategy: screenNameStrategy,
        component: ScreenName,
    };
}
