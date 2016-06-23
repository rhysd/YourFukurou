import * as React from 'react';
import * as classNames from 'classnames';

interface ZigZagSeparatorProps extends React.Props<any> {
    focused?: boolean;
}

const ZigZagSeparator = (props: ZigZagSeparatorProps) => (
    <div className="zigzag-separator">
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
export default ZigZagSeparator;
