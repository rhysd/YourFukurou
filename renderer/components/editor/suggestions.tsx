import * as React from 'react';
import {connect} from 'react-redux';
import {emoji} from 'node-emoji';
import {AutoCompleteLabel} from './auto_complete_decorator';
import {selectAutoCompleteSuggestion} from '../../actions';
import EditorCompletionState from '../../states/editor_completion';
import {TwitterUser} from '../../item/tweet';
import DB from '../../database/db';
import log from '../../log';

const MAX_SUGGESTIONS = 5;

export interface SuggestionItem {
    code?: string;
    icon_url?: string;
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
        }

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

interface ScreenNameEntryProps extends React.Props<any> {
    icon_url: string;
    name: string;
    query: string;
    focused: boolean;
    dispatch?: Redux.Dispatch;
}

const ScreenNameEntry = connect()(
    (props: ScreenNameEntryProps) => {
        function onClick(e: React.MouseEvent) {
            e.preventDefault();
            props.dispatch(selectAutoCompleteSuggestion(props.name + ' ', props.query));
        }

        const n = props.focused ?
            'autocomplete__suggestion-item autocomplete__suggestion-item_focused' :
            'autocomplete__suggestion-item';

        return (
            <div className={n} onClick={onClick}>
                <img
                    className="autocomplete__screenname-icon"
                    src={props.icon_url}
                    alt={props.name}
                />
                <span>{props.name}</span>
            </div>
        );
    }
);

interface HashtagEntryProps extends React.Props<any> {
    query: string;
    text: string;
    focused: boolean;
    dispatch?: Redux.Dispatch;
}

const HashtagEntry = connect()(
    (props: HashtagEntryProps) => {
        function onClick(e: React.MouseEvent) {
            e.preventDefault();
            props.dispatch(selectAutoCompleteSuggestion(props.text + ' ', props.query));
        }

        const n = props.focused ?
            'autocomplete__suggestion-item autocomplete__suggestion-item_focused' :
            'autocomplete__suggestion-item';

        return (
            <div className={n} onClick={onClick}>
                <span>{props.text}</span>
            </div>
        );
    }
);

export type SuggestionsProps = EditorCompletionState & React.Props<AutoCompleteSuggestions>;

export default class AutoCompleteSuggestions extends React.Component<SuggestionsProps, {}> {
    node: HTMLElement;

    moveElement() {
        // XXX:
        // Minus 75px for the width of side menu.
        this.node.style.left = (this.props.pos_left - 75) + 'px';
        this.node.style.top = this.props.pos_top + 'px';
    }

    componentDidUpdate() {
        this.moveElement();
    }

    componentDidMount() {
        this.moveElement();
    }

    renderSuggestionItems() {
        if (this.props.suggestions.length === 0) {
            return undefined;
        }
        const query = this.props.query;
        const idx = this.props.focus_idx;
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

            case 'SCREENNAME': {
                return this.props.suggestions.map((s, i) =>
                    <ScreenNameEntry
                        icon_url={s.icon_url}
                        name={s.description}
                        query={query}
                        focused={idx !== null && idx === i}
                        key={i}
                    />
                );
            }

            case 'HASHTAG': {
                return this.props.suggestions.map((s, i) =>
                    <HashtagEntry
                        query={query}
                        text={s.description}
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
            return Promise.resolve([{
                code: emoji[name],
                description: name,
            }]);
        } else {
            return Promise.resolve([]);
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
            return Promise.resolve(suggestions);
        }
    }
    return Promise.resolve(suggestions);
}


const RE_QUERY_END = /\s$/;
function searchScreenNameSuggestionItems(query: string) {
    'use strict';
    if (RE_QUERY_END.test(query)) {
        return Promise.resolve([]);
    }

    // TODO:
    // If narrowing suggestions, do not access database and filter
    // previous suggestions.

    const input = query.slice(1);  // Note: Omit '@'
    return DB.accounts
        .getUsersByScreenNameStartsWith(input, MAX_SUGGESTIONS)
        .then((us: TwitterUser[]) => us.map(u => ({
            icon_url: u.icon_url_48x48,
            description: '@' + u.screen_name,
        })))
        .catch(() => [] as SuggestionItem[]);
}

function searchHashtagSuggestionItems(query: string) {
    'use strict';
    if (RE_QUERY_END.test(query)) {
        return Promise.resolve([]);
    }

    // TODO:
    // If narrowing suggestions, do not access database and filter
    // previous suggestions.

    const input = query.slice(1);  // Note: Omit '#'
    return DB.hashtags
        .getHashtagsByScreenNameStartsWith(input, MAX_SUGGESTIONS)
        .then((hs: string[]) => hs.map(h => ({
            description: '#' + h,
        })))
        .catch(() => [] as SuggestionItem[]);
}

// TODO:
// Check previous query. If previous one and this one are the same,
// simply returns previous suggestions.
export function searchSuggestionItems(query: string, label: AutoCompleteLabel) {
    'use strict';
    switch (label) {
        case 'EMOJI': return searchEmojiSuggestionItems(query);
        case 'SCREENNAME': return searchScreenNameSuggestionItems(query);
        case 'HASHTAG': return searchHashtagSuggestionItems(query);
        default:
            log.error('Unimplemented auto complete type:', label);
            return Promise.resolve([]);
    }
}
