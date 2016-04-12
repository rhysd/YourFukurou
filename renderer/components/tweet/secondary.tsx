import * as React from 'react';
import ExternalLink from './external-link';

interface TweetSecondaryProps extends React.Props<any> {
    status: TweetStatus;
}

function userLink(screen_name: string) {
    return `https://twitter.com/${screen_name}`;
}

function retweetedBy(user: TweetUser) {
    return <span>
        <i className="fa fa-retweet"/> by @{user.screen_name}
    </span>;
}

const TweetSecondary = (props: TweetSecondaryProps) => {
    const is_retweet = !!props.status.retweeted_status;
    const status = is_retweet ? props.status.retweeted_status : props.status;
    const n = status.user.screen_name;
    return <div className="tweet__secondary">
        <div className="tweet__secondary-name">
            <ExternalLink url={userLink(status.user.screen_name)}>
                {'@' + status.user.screen_name}
            </ExternalLink>
        </div>
        <div className="tweet__secondary-name" title={status.user.name}>
            {status.user.name}
        </div>
        <div className="tweet__secondary-retweetedby">
            {is_retweet ? retweetedBy(props.status.user) : retweetedBy(props.status.user)}
        </div>
    </div>;
};
export default TweetSecondary;
