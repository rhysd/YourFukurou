import * as React from 'react';

interface IconButtonProps extends React.Props<any> {
    readonly name: string;
    readonly className?: string;
    readonly color?: string;
    readonly tip?: string;
    readonly onClick?: (event: React.MouseEvent) => void;
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
