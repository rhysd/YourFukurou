import * as React from 'react';
import ExternalLink from './external-link';
import Tweet from '../../item/tweet';

interface TweetSecondaryProps extends React.Props<any> {
    status: Tweet;
    quoted?: boolean;
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

function retweetedBy(tw: Tweet) {
    if (!tw.isRetweet()) {
        return undefined;
    }

    return (
        <div className="tweet__secondary-retweetedby">
            <i className="fa fa-retweet"/> {userLink(tw.user.screen_name, '#777777')}
        </div>
    );
}

const TweetSecondary = (props: TweetSecondaryProps) => {
    const status = props.status.getMainStatus();
    const user = status.user;
    return <div className="tweet__secondary">
        <div className="tweet__secondary-screenname">
            {userLink(user.screen_name)}
            {user.protected
                ? <i className="fa fa-lock" style={{marginLeft: '4px'}}/>
                : undefined}
        </div>
        <div className="tweet__secondary-name" title={user.name}>
            {user.name}
        </div>
        {retweetedBy(props.status)}
    </div>;
};
export default TweetSecondary;
