import * as React from 'react';
import Popper = require('popper.js');

interface PopupProps extends React.Props<Popup> {
    arrow?: boolean;
    placement?: string;
    children?: (React.Component<any, any> | Element)[];
}

interface PopupState {
    data?: Popper.Data;
}

export default class Popup extends React.Component<PopupProps, PopupState> {
    popper: Popper;
    raf: number;
    update: () => void;
    refs: {
        popper?: HTMLElement;
        content?: HTMLElement;
        arrow?: HTMLElement;
        [key: string]: React.Component<any, any> | Element;
    }

    constructor(props: PopupProps) {
        super(props);
        this.state = {};
        this.update = this.update_.bind(this);
    }

    update_() {
        this.popper && this.popper.update();
        this.raf = this.raf || window.requestAnimationFrame(this.update);
    }

    componentDidMount() {
        console.log('FOO', this.refs.arrow);
        this.popper = new Popper(this.refs.content, this.refs.popper, {
            placement: this.props.placement || 'bottom-start',
            modifiersIgnored: ['applyStyle'],
        });

        this.popper.onUpdate(data => this.setState({data}));
        this.update();
    }

    componentWillUnmount() {
        this.popper && this.popper.destroy();
        this.raf && window.cancelAnimationFrame(this.raf);
    }

    getPopperStyle(data: Popper.Data) {
        if (!data) {
            return undefined;
        }

        const left = Math.round(data.offsets.popper.left);
        const top = Math.round(data.offsets.popper.top);
        const transform = `translate3d(${left}px, ${top}px, 0)`;

        return {
            position: data.offsets.popper.position,
            transform,
            WebkitTransform: transform,
            top: 0,
            left: 0,
        };
    }

    render() {
        return (
            <div>
                <div ref="content" className="popper-content">
                    {this.props.children[0]}
                </div>
                <div
                    ref="popper"
                    className="popper"
                    style={this.getPopperStyle(this.state.data)}
                    data-placement={this.state.data && this.state.data.placement}
                >
                    {this.props.children[1]}
                </div>
            </div>
        );
    }
}
