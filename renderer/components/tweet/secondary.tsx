import * as React from 'react';
import ExternalLink from './external-link';

interface TweetSecondaryProps extends React.Props<any> {
    status: TweetStatus;
}

function userLink(screen_name: string, color?: string) {
    return (
        <ExternalLink
            url={`https://twitter.com/${screen_name}`}
            color={color}
            title={'@' + screen_name}
        >
            {'@' + screen_name}
        </ExternalLink>
    );
}

function retweetedBy(user: TweetUser) {
    return <span>
        <i className="fa fa-retweet"/> {userLink(user.screen_name, '#777777')}
    </span>;
}

const TweetSecondary = (props: TweetSecondaryProps) => {
    const is_retweet = !!props.status.retweeted_status;
    const status = is_retweet ? props.status.retweeted_status : props.status;
    const n = status.user.screen_name;
    return <div className="tweet__secondary">
        <div className="tweet__secondary-screenname">
            {userLink(status.user.screen_name)}
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
