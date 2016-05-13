import * as React from 'react';
import Tweet, {TwitterUser} from '../../item/tweet';
import ScreenName from './screen_name';

interface TweetSecondaryProps extends React.Props<any> {
    status: Tweet;
}

function retweetedBy(tw: Tweet) {
    'use strict';
    if (!tw.isRetweet()) {
        return undefined;
    }

    return (
        <div className="tweet__secondary-retweetedby">
            <i className="fa fa-retweet"/> <ScreenName
                className="tweet__secondary-retweetedby-screenname"
                user={tw.user}
            />
        </div>
    );
}

const TweetSecondary = (props: TweetSecondaryProps) => {
    const status = props.status.getMainStatus();
    const user = status.user;
    return <div className="tweet__secondary">
        <div className="tweet__secondary-screenname">
            <ScreenName user={user}/>
        </div>
        <div className="tweet__secondary-name" title={user.name}>
            {user.name}
        </div>
        {retweetedBy(props.status)}
    </div>;
};
export default TweetSecondary;
