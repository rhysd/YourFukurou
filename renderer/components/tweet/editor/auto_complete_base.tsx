import * as React from 'react';

export interface AutoCompleteProps extends React.Props<AutoComplete> {
    decoratedText: string;
    dir: string;
    entityKey: string;
    offsetKey: string;
    dispatch?: Redux.Dispatch;
}

abstract class AutoComplete extends React.Component<AutoCompleteProps, {}> {
    abstract getClassName(): string;
    abstract getSuggestions(): JSX.Element[];

    componentDidUpdate() {
        // TODO:
        // Dispatch 'previous autocomplete string' action
    }

    render() {
        // TODO:
        // Dispatch 'previous autocomplete string' action

        // TODO:
        // Compare previous autocomplete string and current one,
        // if they are the same, autocomplete window should be closed.
        const should_show_suggestions = true;
        const suggestions = should_show_suggestions ? this.getSuggestions() : undefined;

        return (
            <span className="autocomplete">
                <span className={this.getClassName()}>{this.props.children}</span>
                <div className="autocomplete__suggestions">
                    {suggestions.length > 0 ? suggestions : undefined}
                </div>
            </span>
        );
    }
}

export default AutoComplete;
