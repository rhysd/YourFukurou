import * as React from 'react';
import {connect} from 'react-redux';
import {emoji} from 'node-emoji';
import Dexie from 'dexie';
import * as classNames from 'classnames';
import {AutoCompleteLabel} from './auto_complete_decorator';
import {selectAutoCompleteSuggestion} from '../../actions/editor';
import EditorCompletionState from '../../states/editor_completion';
import DB from '../../database/db';
import log from '../../log';
import {Dispatch} from '../../store';

const Promise = Dexie.Promise;
export const MaxSuggestions = 5;

export interface SuggestionItem {
    code?: string;
    icon_url?: string;
    description: string;
}

interface EmojiEntryProps extends React.Props<any> {
    readonly code: string;
    readonly text: string;
    readonly name: string;
    readonly focused: boolean;
    readonly dispatch?: Dispatch;
}

export const EmojiEntry = connect()(
    (props: EmojiEntryProps) => {
        function onClick(e: React.MouseEvent) {
            e.preventDefault();
            props.dispatch!(selectAutoCompleteSuggestion(props.code, props.text));
        }

        return (
            <div
                className={classNames(
                    'autocomplete__suggestion-item',
                    {'autocomplete__suggestion-item_focused': props.focused},
                )}
                onClick={onClick}
            >
                <span className="autocomplete__emoji-code">{props.code}</span>
                <span className="autocomplete__emoji-text">{`:${props.name}:`}</span>
            </div>
        );
    }
);

interface ScreenNameEntryProps extends React.Props<any> {
    readonly icon_url: string;
    readonly name: string;
    readonly query: string;
    readonly focused: boolean;
    readonly dispatch?: Dispatch;
}

export const ScreenNameEntry = connect()(
    (props: ScreenNameEntryProps) => {
        function onClick(e: React.MouseEvent) {
            e.preventDefault();
            props.dispatch!(selectAutoCompleteSuggestion(props.name + ' ', props.query));
        }

        return (
            <div
                className={classNames(
                    'autocomplete__suggestion-item',
                    {'autocomplete__suggestion-item_focused': props.focused},
                )}
                onClick={onClick}
            >
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
    readonly query: string;
    readonly text: string;
    readonly focused: boolean;
    readonly dispatch?: Dispatch;
}

export const HashtagEntry = connect()(
    (props: HashtagEntryProps) => {
        function onClick(e: React.MouseEvent) {
            e.preventDefault();
            props.dispatch!(selectAutoCompleteSuggestion(props.text + ' ', props.query));
        }

        return (
            <div
                className={classNames(
                    'autocomplete__suggestion-item',
                    {'autocomplete__suggestion-item_focused': props.focused},
                )}
                onClick={onClick}
            >
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
        const {suggestions, query, label} = this.props;
        if (suggestions.length === 0) {
            return undefined;
        }
        const idx = this.props.focus_idx;
        switch (label) {
            case 'EMOJI': {
                return suggestions.map((s, i) =>
                    <EmojiEntry
                        code={s.code!}
                        name={s.description}
                        text={query!}
                        focused={idx !== null && idx === i}
                        key={i}
                    />
                );
            }

            case 'SCREENNAME': {
                return suggestions.map((s, i) =>
                    <ScreenNameEntry
                        icon_url={s.icon_url!}
                        name={s.description}
                        query={query!}
                        focused={idx !== null && idx === i}
                        key={i}
                    />
                );
            }

            case 'HASHTAG': {
                return suggestions.map((s, i) =>
                    <HashtagEntry
                        query={query!}
                        text={s.description}
                        focused={idx !== null && idx === i}
                        key={i}
                    />
                );
            }

            default:
                log.error('Invalid suggestion label on renderSuggestionItems()');
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
    if (query.endsWith(':')) {
        return Promise.resolve([]);
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
        if (count > MaxSuggestions) {
            return Promise.resolve(suggestions);
        }
    }
    return Promise.resolve(suggestions);
}


const RE_QUERY_END = /\s$/;
function searchScreenNameSuggestionItems(query: string) {
    if (RE_QUERY_END.test(query)) {
        return Promise.resolve([]);
    }

    // TODO:
    // If narrowing suggestions, do not access database and filter
    // previous suggestions.

    const input = query.slice(1);  // Note: Omit '@'
    return DB.accounts.getScreenNameSuggestions(input);
}

function hashtagTextToSuggestion(text: string) {
    return {description: '#' + text} as SuggestionItem;
}

function searchHashtagSuggestionItems(query: string): Dexie.Promise<SuggestionItem[]> {
    if (RE_QUERY_END.test(query)) {
        return Promise.resolve([] as SuggestionItem[]);
    }

    // TODO:
    // If narrowing suggestions, do not access database and filter
    // previous suggestions.

    const input = query.slice(1);  // Note: Omit '#'
    if (input.length === 0) {
        const stored = DB.hashtag_completion_history.getHashtags();
        const from_history = stored.map(hashtagTextToSuggestion);

        if (from_history.length >= MaxSuggestions) {
            return Promise.resolve(from_history);
        }

        return DB.hashtags.getHashtagsExceptFor(stored, MaxSuggestions - from_history.length)
            .then(hs => from_history.concat(hs.map(hashtagTextToSuggestion)))
            .catch(() => from_history);
    }

    return DB.hashtags.getHashtagsStartWith(input, MaxSuggestions)
        .then(hs => hs.map(hashtagTextToSuggestion))
        .catch(() => [] as SuggestionItem[]);
}

// TODO:
// Check previous query. If previous one and this one are the same,
// simply returns previous suggestions.
export function searchSuggestionItems(query: string, label: AutoCompleteLabel): Dexie.Promise<SuggestionItem[]> {
    switch (label) {
        case 'EMOJI': return searchEmojiSuggestionItems(query);
        case 'SCREENNAME': return searchScreenNameSuggestionItems(query);
        case 'HASHTAG': return searchHashtagSuggestionItems(query);
        default:
            log.error('Unimplemented auto complete type:', label);
            return Promise.resolve([]);
    }
}
