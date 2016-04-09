import * as React from 'react';

interface IconButtonProps extends React.Props<any> {
    name: string;
    className: string;
    onClick?: (event?: MouseEvent) => void;
}

const IconButton = (props: IconButtonProps) => (
    <div className={props.className} onClick={props.onClick}>
        <i className={`fa fa-${props.name}`}/>
    </div>
)
export default IconButton;
