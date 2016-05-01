import * as React from 'react';
import Tweet from '../../item/tweet';
import ExternalLink from './external-link';
import {TweetTextToken, isHashtag, isMention, isUrl} from '../../tweet_parser';
import log from '../../log';

function mapTokenToElement(className: string, token: TweetTextToken, key: number) {
    'use strict';
    if (typeof token === 'string') {
        return <span key={key}>{token}</span>;
    } else if (isHashtag(token)) {
        return <ExternalLink
            className={className + '-hashtag'}
            url={`https://twitter.com/hashtag/${token.text}?src=hash`}
            key={key}
        >#{token.text}</ExternalLink>;
    } else if (isMention(token)) {
        return <ExternalLink
            className={className + '-mention'}
            url={`https://twitter.com/${token.screen_name}`}
            title={token.name}
            key={key}
        >@{token.screen_name}</ExternalLink>;
    } else if (isUrl(token)) {
        return <ExternalLink
            className={className + '-url'}
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
}

const TweetText = (props: TweetTextProps) => (
    <div className={props.className || 'tweet__text'}>
        {props.status.parsed_tokens.map(mapTokenToElement.bind(null, props.className || 'tweet__text'))}
    </div>
);
export default TweetText;
