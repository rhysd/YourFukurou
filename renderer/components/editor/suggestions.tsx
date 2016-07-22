import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import {selectAutoCompleteSuggestion} from '../../actions/editor';
import EditorCompletionState from '../../states/editor_completion';
import log from '../../log';
import {Dispatch} from '../../store';

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

