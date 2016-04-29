import * as React from 'react';
import IconButton from './icon_button';
import {dismissMessage} from '../actions';

interface MessageProps extends React.Props<any> {
    text: string;
    kind: MessageKind;
    dispatch: Redux.Dispatch;
    duration?: number;
};

export default class Message extends React.Component<MessageProps, {}> {
    node: HTMLElement;

    setupDismiss() {
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
            setTimeout(() => this.setupDismiss(), duration);
        }
    }

    render() {
        return (
            <div
                className={`message__body message__body_${this.props.kind} animated fadeInDown`}
                ref={r => { this.node = r; }}
            >
                <div className="message__text">
                    {this.props.text}
                </div>
                <IconButton
                    className="message__x-btn"
                    name="times-circle-o"
                    onClick={() => this.setupDismiss()}
                />
            </div>
        );
    }
}
