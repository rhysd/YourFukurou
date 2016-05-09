import * as React from 'react';
import {Twitter} from 'twit';
import {openExternalLink} from './external-link';
import log from '../../log';
import Tweet, {TwitterUser} from '../../item/tweet';
import TweetActionButton from './action_button';
import TweetText from './text';
import QuotedTweet from './quote';
import TweetMedia from './media';
import OtherActionsButton from './other_actions_button';

interface TweetPrimaryProps extends React.Props<any> {
    isMyTweet: boolean;
    status: Tweet;
}

export default class TweetPrimary extends React.Component<TweetPrimaryProps, {}> {
    actions_elem: HTMLElement;

    renderCreatedAt() {
        return (
            <a
                className="tweet__primary-created-at external-link"
                href={this.props.status.statusPageUrl()}
                onClick={openExternalLink}
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
        return (
            <div
                className={'tweet__primary'}
                onMouseEnter={() => { this.actions_elem.style.display = 'flex'; }}
                onMouseLeave={() => { this.actions_elem.style.display = 'flex'; }}
            >
                <TweetText status={s}/>
                {this.renderQuotedStatus(s)}
                {this.renderMedia(s.media)}
                <div className="tweet__primary-footer" >
                    <div
                        className="tweet-actions"
                        style={{display: 'flex'}}
                        ref={r => {this.actions_elem = r; }}
                    >
                        <TweetActionButton kind="reply" status={s}/>
                        <TweetActionButton kind="retweet" status={s} isMyTweet={this.props.isMyTweet}/>
                        <TweetActionButton kind="like" status={s}/>
                        {this.props.isMyTweet ?
                            <TweetActionButton kind="delete" status={s}/> :
                            undefined}
                        <OtherActionsButton status={s}/>
                    </div>
                    <div className="spacer"/>
                    {this.renderConversation(s)}
                    {this.renderCreatedAt()}
                </div>
            </div>
        );
    }
}

