import * as React from 'react';

interface IconButtonProps extends React.Props<any> {
    name: string;
    className: string;
    color?: string;
    tip?: string;
    onClick?: (event?: MouseEvent) => void;
}

const IconButton = (props: IconButtonProps) => (
    <div
        className={props.className}
        title={props.tip}
        style={{color: props.color}}
        onClick={props.onClick}
    >
        <i className={`fa fa-${props.name}`}/>
    </div>
);
export default IconButton;
