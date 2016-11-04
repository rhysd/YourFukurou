import * as React from 'react';
import {Twitter} from 'twit';
import * as classNames from 'classnames';
import TweetItem from '../../item/tweet';
import ScreenName from './screen_name';
import TweetText from './text';
import TweetMedia from './media';

interface QuotedTweetProps extends React.Props<any> {
    readonly status: TweetItem;
    readonly focused: boolean;
}

export default class QuotedTweet extends React.Component<QuotedTweetProps, {}> {
    handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.props.status.getMainStatus().openStatusPageInBrowser();
    }

    renderMedia(media: Twitter.MediaEntity[]) {
        if (media.length === 0) {
            return undefined;
        }
        return <TweetMedia entities={media}/>;
    }

    renderHeader(s: TweetItem) {
        return (
            <div className="tweet__quoted-header">
                <span
                    className="tweet__quoted-icon"
                    onClick={this.handleClick}
                >
                    <i className="fa fa-quote-left"/>
                </span> from <ScreenName
                    className="tweet__quoted-screenname"
                    user={s.user}
                />
            </div>
        );
    }

    render() {
        const s = this.props.status.getMainStatus();
        return (
            <div className={classNames(
                'tweet__quoted',
                {tweet__quoted_focused: this.props.focused},
            )}>
                {this.renderHeader(s)}
                <TweetText className="tweet__quoted-text" status={s}/>
                {this.renderMedia(s.media)}
            </div>
        );
    }
}
