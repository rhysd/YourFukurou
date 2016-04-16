import * as React from 'react';

interface ZigZagSeparatorProps extends React.Props<any> {
}

const ZigZagSeparator = (props: ZigZagSeparatorProps) => (
    <div className="zigzag-separator">
        <div className="zigzag-separator__top"/>
        <div className="zigzag-separator__middle zigzag-separator__jagged"/>
        <div className="zigzag-separator__bottom zigzag-separator__jagged"/>
    </div>
);
export default ZigZagSeparator;
