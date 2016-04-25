import * as React from 'react';
import {connect} from 'react-redux';
import {emoji} from 'node-emoji';
import {ContentBlock} from 'draft-js';
import AutoComplete from './auto_complete_base';
import {selectAutoCompleteSuggestion} from '../../../actions';

export interface EmojiSuggestionProps extends React.Props<any> {
    code: string;
    name: string;
    text: string;
    dispatch?: Redux.Dispatch;
}

function select(props: EmojiSuggestionProps) {
    'use strict';
    props.dispatch(selectAutoCompleteSuggestion(`:${props.name}:`, props.text));
}

export const EmojiSuggestion = connect()(
    (props: EmojiSuggestionProps) => (
        <div className="autocomplete__emoji" onClick={() => select(props)}>
            <span className="autocomplete__emoji-code">{props.code}</span>
            <span className="autocomplete__emoji-name">{props.name}</span>
        </div>
    )
);

export class EmojiComplete extends AutoComplete {
    getClassName(): string {
        return undefined;
    }

    getSuggestions() {
        console.error(this.props);
        const text = this.props.decoratedText;
        if (text.endsWith(':')) {
            const name = text.slice(1, text.length - 1);
            if (emoji[name]) {
                return [
                    <EmojiSuggestion
                        code={emoji[name]}
                        name={name}
                        text={text}
                        key="0"
                    />
                ];
            } else {
                return [];
            }
        }

        let count = 0;
        let suggestions = [] as JSX.Element[];
        const query = text.slice(1);
        for (const name in emoji) {
            if (name.startsWith(query)) {
                suggestions.push(
                    <EmojiSuggestion
                        code={emoji[name]}
                        name={name}
                        text={text}
                        key={count}
                    />
                );
                count += 1;
            }
            if (count > 5) {
                return suggestions;
            }
        }
        return suggestions;
    }
}

const RE_EMOJI = /:(?:[a-zA-Z0-9_\-\+]+):?/g;

function emojiCompleteStrategy(contentBlock: ContentBlock, callback: (s: number, e: number) => void) {
    'use strict';
    const text = contentBlock.getText();
    while (true) {
        const match = RE_EMOJI.exec(text);
        if (match === null) {
            return;
        }
        const start = match.index;
        callback(start, start + match[0].length);
    }
}

const EmojiCompleteDecorator = {
    strategy: emojiCompleteStrategy,
    component: EmojiComplete,
};
export default EmojiCompleteDecorator;
