import * as React from 'react';
import Tweet, {TwitterUser} from '../../item/tweet';
import ScreenName from './screen_name';

interface TweetSecondaryProps extends React.Props<any> {
    status: Tweet;
    focused?: boolean;
}

function retweetedBy(tw: Tweet, focused: boolean) {
    'use strict';
    if (!tw.isRetweet()) {
        return undefined;
    }

    return (
        <div className={
            focused ?
                'tweet__secondary-retweetedby tweet__secondary-retweetedby_focused' :
                'tweet__secondary-retweetedby'
            }>
            <i className="fa fa-retweet"/> <ScreenName user={tw.user}/>
        </div>
    );
}

const TweetSecondary = (props: TweetSecondaryProps) => {
    const status = props.status.getMainStatus();
    const user = status.user;
    return <div className="tweet__secondary">
        <ScreenName
            className={props.focused ?
                        'tweet__secondary-screenname tweet__secondary-screenname_focused' :
                        'tweet__secondary-screenname'}
            user={user}
        />
        <div className="tweet__secondary-name" title={user.name}>
            {user.name}
        </div>
        {retweetedBy(props.status, props.focused)}
    </div>;
};
export default TweetSecondary;
