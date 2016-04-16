import * as React from 'react';
import {openExternalLink} from './external-link';
import log from '../../log';
import Tweet from '../../item/tweet';
import TweetActionButton from './action_button';

interface TweetPrimaryProps extends React.Props<any> {
    status: Tweet;
}

export default class TweetPrimary extends React.Component<TweetPrimaryProps, {}> {
    body_elem: HTMLElement;
    actions_elem: HTMLElement

    componentDidMount() {
        Array.prototype.forEach.call(this.body_elem.querySelectorAll("a"), (a: HTMLElement) => {
            a.className = 'external-link';
            a.onclick = openExternalLink;
        });
    }

    render() {
        const s = this.props.status.getMainStatus();
        return (
            <div
                className="tweet__primary"
                onMouseEnter={() => { this.actions_elem.style.display = 'flex'; }}
                onMouseLeave={() => { this.actions_elem.style.display = 'none'; }}
                ref={r => { this.body_elem = r; }}
            >
                <div
                    className="tweet__primary-text"
                    dangerouslySetInnerHTML={{__html: s.buildLinkedHTML()}}
                />
                <div className="tweet__primary-footer" >
                    <div
                        className="tweet-actions"
                        style={{display: 'none'}}
                        ref={r => {this.actions_elem = r; }}
                    >
                        <TweetActionButton kind="reply" status={s}/>
                        <TweetActionButton kind="retweet" status={s}/>
                        <TweetActionButton kind="like" status={s}/>
                    </div>
                    <div className="spacer"/>
                    <div className="tweet__primary-createdby">
                        {this.props.status.getCreatedAtString()}
                    </div>
                </div>
            </div>
        );
    }
}

