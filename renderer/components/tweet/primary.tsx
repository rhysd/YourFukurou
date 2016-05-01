import * as React from 'react';
import {openExternalLink} from './external-link';
import log from '../../log';
import Tweet, {TwitterUser} from '../../item/tweet';
import TweetActionButton from './action_button';
import TweetText from './text';
import QuotedTweet from './quote';

interface TweetPrimaryProps extends React.Props<any> {
    user: TwitterUser;
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

    render() {
        const s = this.props.status.getMainStatus();
        return (
            <div
                className={'tweet__primary'}
                onMouseEnter={() => { this.actions_elem.style.display = 'flex'; }}
                onMouseLeave={() => { this.actions_elem.style.display = 'none'; }}
            >
                <TweetText status={s}/>
                {this.renderQuotedStatus(s)}
                <div className="tweet__primary-footer" >
                    <div
                        className="tweet-actions"
                        style={{display: 'none'}}
                        ref={r => {this.actions_elem = r; }}
                    >
                        <TweetActionButton kind="reply" status={s}/>
                        {s.user.id === this.props.user.id ?
                            <TweetActionButton kind="delete" status={s}/> :
                            <TweetActionButton kind="retweet" status={s}/>}
                        <TweetActionButton kind="retweet" status={s}/>
                        <TweetActionButton kind="like" status={s}/>
                    </div>
                    <div className="spacer"/>
                    {this.renderConversation(s)}
                    {this.renderCreatedAt()}
                </div>
            </div>
        );
    }
}

