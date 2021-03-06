import * as React from 'react';
import IconButton from './icon_button';
import {dismissMessage} from '../actions/message';
import {MessageKind} from '../reducers/message';
import {Dispatch} from '../store';

interface MessageProps extends React.Props<any> {
    readonly text: string;
    readonly kind: MessageKind;
    readonly dispatch: Dispatch;
    readonly duration?: number;
};

export default class Message extends React.Component<MessageProps, {}> {
    node: HTMLElement;

    onNodeRef = (ref: HTMLElement) => {
        this.node = ref;
    }

    setupDismiss = () => {
        if (this.node === null) {
            // Note: When already this component was removed
            return;
        }
        this.node.addEventListener('animationend', () => {
            this.props.dispatch(dismissMessage());
        });
        this.node.classList.remove('fadeInDown');
        this.node.classList.add('fadeOutUp');
    }

    componentDidMount() {
        const duration = this.props.duration || 3000;
        if (duration !== Infinity) {
            setTimeout(this.setupDismiss, duration);
        }
    }

    getIcon() {
        switch (this.props.kind) {
            case 'info': return 'check';
            case 'error': return 'exclamation-circle';
            default: return '';
        }
    }

    render() {
        return (
            <div
                className={`message__body message__body_${this.props.kind} animated fadeInDown`}
                ref={this.onNodeRef}
            >
                <div className="message__icon">
                    <i className={`fa fa-${this.getIcon()}`}/>
                </div>
                <div className="message__text">
                    {this.props.text}
                </div>
                <IconButton
                    className="message__x-btn"
                    name="times-circle-o"
                    onClick={this.setupDismiss}
                />
            </div>
        );
    }
}
