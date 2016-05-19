import * as React from 'react';
import Tweet from '../../item/tweet';
import ExternalLink from '../external_link';
import {TweetTextToken, isHashtag, isMention, isUrl} from '../../tweet_parser';
import log from '../../log';

function mapTokenToElement(class_prefix: string, focused: boolean, token: TweetTextToken, key: number) {
    'use strict';

    const class_for =
        (suffix: string) =>
            focused ?
                `${class_prefix}-${suffix} ${class_prefix}-${suffix}_focused` :
                `${class_prefix}-${suffix}`;

    if (typeof token === 'string') {
        return <span key={key}>{token}</span>;
    } else if (isHashtag(token)) {
        return <ExternalLink
            className={class_for('hashtag')}
            url={`https://twitter.com/hashtag/${token.text}?src=hash`}
            key={key}
        >#{token.text}</ExternalLink>;
    } else if (isMention(token)) {
        return <ExternalLink
            className={class_for('mention')}
            url={`https://twitter.com/${token.screen_name}`}
            title={token.name}
            key={key}
        >@{token.screen_name}</ExternalLink>;
    } else if (isUrl(token)) {
        return <ExternalLink
            className={class_for('url')}
            url={token.expanded_url}
            key={key}
        >{token.display_url}</ExternalLink>;
    } else {
        log.error('Invalid token:', token);
        return undefined;
    }
}

interface TweetTextProps extends React.Props<any> {
    status: Tweet;
    className?: string;
    focused?: boolean;
}

const TweetText: React.StatelessComponent<TweetTextProps> = props => {
    const class_name = props.className || 'tweet__text';
    return (
        <div className={class_name}>
            {props.status.parsed_tokens.map(mapTokenToElement.bind(null, class_name, props.focused))}
        </div>
    );
};
export default TweetText;
