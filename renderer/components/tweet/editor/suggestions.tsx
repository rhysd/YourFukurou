import * as React from 'react';
import {connect} from 'react-redux';
import {emoji} from 'node-emoji';
import {AutoCompleteLabel} from './auto_complete_decorator';
import {selectAutoCompleteSuggestion} from '../../../actions';
import log from '../../../log';

const MAX_SUGGESTIONS = 5;

export interface SuggestionItem {
    code?: string;
    description: string;
}

interface EmojiEntryProps extends React.Props<any> {
    code: string;
    text: string;
    name: string;
    focused: boolean;
    dispatch?: Redux.Dispatch;
}

const EmojiEntry = connect()(
    (props: EmojiEntryProps) => {
        function onClick(e: React.MouseEvent) {
            e.preventDefault();
            props.dispatch(selectAutoCompleteSuggestion(props.code, props.text));
        };

        const n = props.focused ?
            'autocomplete__suggestion-item autocomplete__suggestion-item_focused' :
            'autocomplete__suggestion-item';

        return (
            <div className={n} onClick={onClick}>
                <span className="autocomplete__emoji-code">{props.code}</span>
                <span className="autocomplete__emoji-text">{`:${props.name}:`}</span>
            </div>
        );
    }
);

export interface SuggestionsProps extends React.Props<AutoCompleteSuggestions> {
    label: AutoCompleteLabel;
    query: string;
    left: number;
    top: number;
    suggestions: SuggestionItem[];
    focusIdx: number;
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

    renderSuggestionItems() {
        if (this.props.suggestions.length == 0) {
            return undefined;
        }
        const query = this.props.query;
        const idx = this.props.focusIdx;
        switch (this.props.label) {
            case 'EMOJI': {
                return this.props.suggestions.map((s, i) =>
                    <EmojiEntry
                        code={s.code}
                        name={s.description}
                        text={query}
                        focused={idx !== null && idx === i}
                        key={i}
                    />
                );
            }
            default:
                log.error('Invalid suggestion label: ' + this.props.label);
                return undefined;
        }
    }

    render() {
        return (
            <div className="autocomplete__suggestions" ref={r => { this.node = r; }}>
                {this.renderSuggestionItems()}
            </div>
        );
    }
}

function searchEmojiSuggestionItems(query: string) {
    'use strict';
    if (query.endsWith(':')) {
        const name = query.slice(1, query.length - 1);  // Note: Omit first and last ':'
        if (emoji[name]) {
            return [{
                code: emoji[name],
                description: name,
            }];
        } else {
            return [];
        }
    }

    // TODO:
    // If narrowing suggestions, we can reuse the previous
    // suggestions and filter it.

    let count = 0;
    let suggestions = [] as SuggestionItem[];
    const input = query.slice(1);  // Note: Omit ':'
    for (const name in emoji) {
        if (name.startsWith(input)) {
            suggestions.push({
                code: emoji[name],
                description: name,
            });
            count += 1;
        }
        if (count > MAX_SUGGESTIONS) {
            return suggestions;
        }
    }
    return suggestions;
}

export function searchSuggestionItems(query: string, label: AutoCompleteLabel) {
    'use strict';
    switch (label) {
        case 'EMOJI': return searchEmojiSuggestionItems(query);
        default:
            log.error('Unimplemented auto complete type:', label);
            return []
    }
}
