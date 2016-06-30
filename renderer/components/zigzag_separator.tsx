import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import Separator from '../item/separator';
import log from '../log';

interface Props extends React.Props<ZigZagSeparator> {
    itemIndex?: number;
    focused?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

interface State {
    loading: boolean;
}

export default class ZigZagSeparator extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.onClick = props.onClick || this.onClick.bind(this);
        this.state = {loading: false};
    }

    onClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (this.props.itemIndex !== undefined) {
            Separator.dispatchMissingStatusesAt(this.props.itemIndex);
            this.setState({loading: true});
        }
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
                        'zigzag-separator__focused-middle': this.props.focused,
                        'zigzag-separator__middle': !this.props.focused,
                    }, 'zigzag-separator__jagged')}
                />
                <div className="zigzag-separator__bottom zigzag-separator__jagged"/>
            </div>
        );
    }
}
