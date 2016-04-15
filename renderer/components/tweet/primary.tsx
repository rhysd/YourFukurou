import * as React from 'react';
import {openExternalLink} from './external-link';
import log from '../../log';
import Tweet from '../../item/tweet';

interface TweetPrimaryProps extends React.Props<any> {
    status: Tweet;
}

export default class TweetPrimary extends React.Component<TweetPrimaryProps, {}> {
    body: HTMLElement;

    componentDidMount() {
        Array.prototype.forEach.call(this.body.querySelectorAll("a"), (a: HTMLElement) => {
            a.className = 'external-link';
            a.onclick = openExternalLink;
        });
    }

    render() {
        return <div className="tweet__primary" ref={r => { this.body = r; }}>
            <div
                className="tweet__primary-text"
                dangerouslySetInnerHTML={{__html: this.props.status.buildLinkedHTML()}}
            />
            <div className="tweet__primary-createdby">
                {this.props.status.getCreatedAtString()}
            </div>
        </div>;
    }
}

