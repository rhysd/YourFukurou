import * as React from 'react';
import {Twitter} from 'twit';
import * as classNames from 'classnames';
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
    onClickConversation: (e: React.MouseEvent) => void;
}

export default class TweetPrimary extends React.Component<TweetPrimaryProps, {}> {
    actions_elem: HTMLElement;

    constructor(props: TweetPrimaryProps) {
        super(props);
        this.showActions = this.showActions.bind(this);
        this.hideActions = this.hideActions.bind(this);
    }

    showActions() {
        this.actions_elem.style.display = 'flex';
    }

    hideActions() {
        if (!this.props.focused) {
            this.actions_elem.style.display = 'none';
        }
    }

    renderCreatedAt() {
        return (
            <span
                className={classNames(
                    'tweet__primary-created-at',
                    {'tweet__primary-created-at_focused': this.props.focused}
                )}
                onClick={this.props.onClickConversation}
            >
                {this.props.status.getCreatedAtString()}
            </span>
        );
    }

    renderConversation(s: Tweet) {
        if (!s.hasInReplyTo()) {
            return undefined;
        }
        return (
            <div
                className={classNames(
                    'tweet__primary-conversation',
                    {'tweet__primary-conversation_focused': this.props.focused}
                )}
                onClick={this.props.onClickConversation}
            >
                <i className="fa fa-comments" style={{marginRight: '4px'}}/>
            </div>
        );
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
        const {status, owner, focused} = this.props;
        const s = status.getMainStatus();
        return (
            <div
                className="tweet__primary"
                onMouseEnter={this.showActions}
                onMouseLeave={this.hideActions}
            >
                <TweetText status={s} focused={focused}/>
                {this.renderQuotedStatus(s)}
                {this.renderMedia(s.media)}
                <div className="tweet__primary-footer" >
                    <div
                        className={classNames(
                            'tweet-actions',
                            {'tweet-actions_focused': focused}
                        )}
                        style={{display: focused ? 'flex' : 'none'}}
                        ref={r => {this.actions_elem = r; }}
                    >
                        <TweetActionButton kind="reply" owner={owner} status={s}/>
                        <TweetActionButton kind="retweet" owner={owner} status={s}/>
                        <TweetActionButton kind="like" owner={owner} status={s}/>
                        <OtherActionsButton owner={owner} status={status}/>
                    </div>
                    <div className="spacer"/>
                    {this.renderConversation(s)}
                    {this.renderCreatedAt()}
                </div>
            </div>
        );
    }
}

