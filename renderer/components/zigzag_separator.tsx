import * as React from 'react';
import * as classNames from 'classnames';
import {completeMissingStatuses} from '../actions';

interface Props extends React.Props<ZigZagSeparator> {
    itemIndex?: number;
    focused?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    dispatch: Redux.Dispatch;
}

interface State {
    loading: boolean;
}

export default class ZigZagSeparator extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.state = {loading: false};
    }

    // XXX:
    // This component owns its state.  We can't change the state via keymaps.
    onClick(e: React.MouseEvent) {
        const {onClick, itemIndex, dispatch} = this.props;
        if (onClick) {
            onClick(e);
        } else if (itemIndex !== undefined) {
            e.stopPropagation();
            dispatch(completeMissingStatuses(itemIndex));
        }
        this.setState({loading: true});
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="zigzag-separator_loading">
                    <div className="zigzag-separator_loading-icon">
                        <i className="fa fa-spinner fa-pulse fa-lg fa-fw"></i>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="zigzag-separator" onClick={this.onClick}>
                <div className="zigzag-separator__top"/>
                <div
                    className={classNames({
                        'zigzag-separator__focused-middle': !!this.props.focused,
                        'zigzag-separator__middle': !this.props.focused,
                    }, 'zigzag-separator__jagged')}
                />
                <div className="zigzag-separator__bottom zigzag-separator__jagged"/>
            </div>
        );
    }
}
