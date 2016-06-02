import * as React from 'react';

interface Props extends React.Props<any> {
    className?: string;
    onClick: (e: React.MouseEvent) => void;
}

export default class UndraggableClickable extends React.Component<Props, {}> {
    dragged: boolean;

    constructor(props: Props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onMouseDown() {
        this.dragged = false;
    }

    onMouseMove() {
        this.dragged = true;
    }

    onClick(e: React.MouseEvent) {
        if (!this.dragged) {
            this.props.onClick(e);
        }
    }

    render() {
        return (
            <div
                className={this.props.className}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onClick={this.onClick}
            >
                {this.props.children}
            </div>
        );
    }
}

