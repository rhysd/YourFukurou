import * as React from 'react';
import {connect} from 'react-redux';
import {emoji} from 'node-emoji';
import {AutoCompleteLabel} from './auto_complete_decorator';
import {selectAutoCompleteSuggestion} from '../../../actions';
import log from '../../../log';

const MAX_SUGGESTIONS = 5;

export interface SuggestionItem {
    code?: string;
    text: string;
}

interface EmojiEntryProps extends React.Props<any> {
    code: string;
    text: string;
    name: string;
    dispatch?: Redux.Dispatch;
}

function onClickEmojiEntry(props: EmojiEntryProps, e: React.MouseEvent) {
    'use strict';
    e.preventDefault();
    props.dispatch(selectAutoCompleteSuggestion(props.code, props.text));
}

const EmojiEntry = connect()(
    (props: EmojiEntryProps) => (
        <div className="autocomplete__emoji" onClick={onClickEmojiEntry.bind(this, props)}>
            <span className="autocomplete__emoji-code">{props.code}</span>
            <span className="autocomplete__emoji-text">{`:${props.name}:`}</span>
        </div>
    )
);

export interface SuggestionsProps extends React.Props<AutoCompleteSuggestions> {
    label: AutoCompleteLabel;
    query: string;
    left: number;
    top: number;
}

export default class AutoCompleteSuggestions extends React.Component<SuggestionsProps, {}> {
    node: HTMLElement;

    moveElement() {
        // XXX:
        // Minus 75px for the width of side menu.
        this.node.style.left = (this.props.left - 75) + 'px';
        this.node.style.top = this.props.top + 'px';
    }

    componentDidUpdate() {
        this.moveElement();
    }

    componentDidMount() {
        this.moveElement();
    }

    renderEmojiSuggestionItems() {
        const query = this.props.query;
        if (query.endsWith(':')) {
            const name = query.slice(1, query.length - 1);  // Note: Omit first and last ':'
            if (emoji[name]) {
                return [
                    <EmojiEntry
                        code={emoji[name]}
                        name={name}
                        text={query}
                        key="0"
                    />
                ];
            } else {
                return [];
            }
        }

        let count = 0;
        let suggestions = [] as JSX.Element[];
        const input = query.slice(1);  // Note: Omit ':'
        for (const name in emoji) {
            if (name.startsWith(input)) {
                suggestions.push(
                    <EmojiEntry
                        code={emoji[name]}
                        name={name}
                        text={query}
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

    renderSuggestionItems() {
        switch (this.props.label) {
            case 'EMOJI': return this.renderEmojiSuggestionItems();
            default:
                log.error('Invalid suggestion label: ' + this.props.label);
                return [];
        }
    }

    render() {
        return (
            <div className="autocomplete__suggestions" ref={r => { this.node = r; }}>
                {this.renderSuggestionItems() || undefined}
            </div>
        );
    }
}

