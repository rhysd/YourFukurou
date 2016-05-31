import * as React from 'react';

interface UndraggableClickableProps extends React.Props<any> {
    className?: string;
    onClick: (e: React.MouseEvent) => void;
}

const UndraggableClickable: React.StatelessComponent<UndraggableClickableProps> = props => (
    <div
        className={props.className}
        onMouseDown={() => { this.dragged = false; }}
        onMouseMove={() => { this.dragged = true; }}
        onMouseUp={e => !this.dragged && props.onClick(e) }
    >
        {props.children}
    </div>
);
export default UndraggableClickable;
