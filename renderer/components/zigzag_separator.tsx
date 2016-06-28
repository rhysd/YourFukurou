import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import Separator from '../item/separator';
import log from '../log';

interface ConnectedProps extends React.Props<any> {
    itemIndex?: number;
    focused?: boolean;
}

interface DispatchProps {
    onClick: (e: React.MouseEvent) => void;
}

type ZigZagSeparatorProps = ConnectedProps & DispatchProps;

export const ZigZagSeparator = (props: ZigZagSeparatorProps) => (
    <div className="zigzag-separator" onClick={props.onClick}>
        <div className="zigzag-separator__top"/>
        <div
            className={classNames({
                'zigzag-separator__focused-middle': props.focused,
                'zigzag-separator__middle': !props.focused,
            }, 'zigzag-separator__jagged')}
        />
        <div className="zigzag-separator__bottom zigzag-separator__jagged"/>
    </div>
);

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            if (props.itemIndex !== undefined) {
                Separator.dispatchMissingStatusesAt(props.itemIndex);
            }
        },
    };
}

export default connect(null, mapDispatch)(ZigZagSeparator);
