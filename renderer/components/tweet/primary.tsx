import * as React from 'react';
import {Twitter} from 'twit';
import log from '../../log';
import Tweet, {TwitterUser} from '../../item/tweet';
import TweetActionButton from './action_button';
import TweetText from './text';
import QuotedTweet from './quote';
import TweetMedia from './media';
import OtherActionsButton from './other_actions_button';

interface TweetPrimaryProps extends React.Props<any> {
    user: TwitterUser;
    status: Tweet;
}

export default class TweetPrimary extends React.Component<TweetPrimaryProps, {}> {
    actions_elem: HTMLElement;
    showActions: () => void;
    hideActions: () => void;

    constructor(props: TweetPrimaryProps) {
        super(props);
        this.showActions = () => {
            this.actions_elem.style.display = 'flex';
        };
        this.hideActions = () => {
            this.actions_elem.style.display = 'none';
        }
    }

    renderCreatedAt() {
        return (
            <a
                className="tweet__primary-created-at"
                href="#"
                onClick={() => this.props.status.openStatusPageInBrowser()}
            >
                {this.props.status.getCreatedAtString()}
            </a>
        );
    }

    renderConversation(s: Tweet) {
        if (!s.hasInReplyTo()) {
            return undefined;
        }
        return <div className="tweet__primary-conversation">
            <i className="fa fa-comments" style={{marginRight: '4px'}}/>
        </div>;
    }

    renderQuotedStatus(s: Tweet): JSX.Element {
        const q = s.quoted_status;
        if (q === null) {
            return undefined;
        }
        return <QuotedTweet status={q}/>;
    }

    renderMedia(media: Twitter.MediaEntity[]) {
        if (media.length === 0) {
            return undefined;
        }
        return <TweetMedia entities={media}/>;
    }

    render() {
        const s = this.props.status.getMainStatus();
        const action_props = {
            status: s,
            user: this.props.user,
        };

        return (
            <div
                className={'tweet__primary'}
                onMouseEnter={this.showActions}
                onMouseLeave={this.hideActions}
            >
                <TweetText status={s}/>
                {this.renderQuotedStatus(s)}
                {this.renderMedia(s.media)}
                <div className="tweet__primary-footer" >
                    <div
                        className="tweet-actions"
                        style={{display: 'none'}}
                        ref={r => {this.actions_elem = r; }}
                    >
                        <TweetActionButton kind="reply" {...action_props}/>
                        <TweetActionButton kind="retweet" {...action_props}/>
                        <TweetActionButton kind="like" {...action_props}/>
                        <OtherActionsButton {...action_props}/>
                    </div>
                    <div className="spacer"/>
                    {this.renderConversation(s)}
                    {this.renderCreatedAt()}
                </div>
            </div>
        );
    }
}

