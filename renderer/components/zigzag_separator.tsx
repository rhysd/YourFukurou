import * as React from 'react';

interface ZigZagSeparatorProps extends React.Props<any> {
    focused?: boolean;
}

function focusedClass(base: string, focused: boolean) {
    'use strict';
    return focused ?  `${base} ${base}_focused` : base;
}

const ZigZagSeparator = (props: ZigZagSeparatorProps) => (
    <div className="zigzag-separator">
        <div className={
            props.focused ?
                'zigzag-separator__top zigzag-separator__top_focused' :
                'zigzag-separator__top'
        }/>
        <div className="zigzag-separator__middle zigzag-separator__jagged"/>
        <div className={
            props.focused ?
                'zigzag-separator__focused-bottom zigzag-separator__jagged' :
                'zigzag-separator__bottom zigzag-separator__jagged'
        }/>
    </div>
);
export default ZigZagSeparator;
