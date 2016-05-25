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
    owner: TwitterUser;
    status: Tweet;
    focused: boolean;
}

export default class TweetPrimary extends React.Component<TweetPrimaryProps, {}> {
    actions_elem: HTMLElement;
    showActions: () => void;
    hideActions: () => void;
    openStatus: (e: React.MouseEvent) => void;

    constructor(props: TweetPrimaryProps) {
        super(props);
        this.showActions = () => {
            this.actions_elem.style.display = 'flex';
        };
        this.hideActions = () => {
            if (!this.props.focused) {
                this.actions_elem.style.display = 'none';
            }
        }
        this.openStatus = e => {
            e.stopPropagation();
            this.props.status.openStatusPageInBrowser();
        };
    }

    renderCreatedAt() {
        const class_name = this.props.focused ?
            'tweet__primary-created-at tweet__primary-created-at_focused':
            'tweet__primary-created-at';
        return (
            <span
                className={class_name}
                onClick={this.openStatus}
            >
                {this.props.status.getCreatedAtString()}
            </span>
        );
    }

    renderConversation(s: Tweet) {
        if (!s.hasInReplyTo()) {
            return undefined;
        }
        const class_name = this.props.focused ?
            'tweet__primary-conversation tweet__primary-conversation_focused' :
            'tweet__primary-conversation';
        return <div className={class_name}>
            <i className="fa fa-comments" style={{marginRight: '4px'}}/>
        </div>;
    }

    renderQuotedStatus(s: Tweet): JSX.Element {
        const q = s.quoted_status;
        if (q === null) {
            return undefined;
        }
        return <QuotedTweet status={q} focused={this.props.focused}/>;
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
            owner: this.props.owner,
        };

        return (
            <div
                className="tweet__primary"
                onMouseEnter={this.showActions}
                onMouseLeave={this.hideActions}
            >
                <TweetText status={s} focused={this.props.focused}/>
                {this.renderQuotedStatus(s)}
                {this.renderMedia(s.media)}
                <div className="tweet__primary-footer" >
                    <div
                        className={this.props.focused ?
                                    'tweet-actions tweet-actions_focused' :
                                    'tweet-actions'}
                        style={{display: this.props.focused ? 'flex' : 'none'}}
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

