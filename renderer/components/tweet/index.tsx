import * as React from 'react';
import TweetItem from '../../item/tweet';
import TweetPrimary from './primary';
import TweetSecondary from './secondary';
import TweetIcon from './icon';

// TODO:
// Enable to expand/contract tweet panel like as YoruFukurou
// TODO:
// Enable to focus/unfocus tweet panel like as YoruFukurou

interface TweetProps extends React.Props<Tweet> {
    status: TweetItem;
    quoted?: boolean;
}

export default class Tweet extends React.Component<TweetProps, {}> {
    node: HTMLElement;

    componentDidMount() {
        if (!this.node) {
            return;
        }
        // Note: Ensure to animate the element once
        const listener = () => {
            this.node.className = 'tweet__body';
            this.node.removeEventListener('animationend', listener);
        };
        this.node.addEventListener('animationend', listener);
    }

    renderQuotedStatus() {
        return <div classname="tweet__quoted-body">
            <TweetSecondary status={this.props.status} quoted/>
            <TweetPrimary status={this.props.status}/>
        </div>;
    }

    render() {
        if (this.props.quoted) {
            return <div classname="tweet__quoted-body">
                <TweetSecondary status={this.props.status} quoted/>
                <TweetPrimary status={this.props.status}/>
            </div>;
        }

        const tw = this.props.status.getMainStatus();
        return <div className="tweet__body animated fadeIn" ref={r => { this.node = r; }} >
            <TweetIcon user={tw.user}/>
            <TweetSecondary status={this.props.status}/>
            <TweetPrimary status={this.props.status}/>
        </div>;
    }
}

