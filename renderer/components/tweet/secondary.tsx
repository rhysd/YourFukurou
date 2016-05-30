import * as React from 'react';
import Tweet, {TwitterUser} from '../../item/tweet';
import ScreenName from './screen_name';
import Avatar from '../avatar';

interface SmallIconProps extends React.Props<any> {
    user: TwitterUser;
}

const SmallIcon: React.StatelessComponent<SmallIconProps> = props => (
    <div className="tweet__small-icon">
        <Avatar
            screenName={props.user.screen_name}
            imageUrl={props.user.icon_url_24x24}
            size={12}
            title={'@' + props.user.screen_name}
        />
    </div>
);

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
        <div
            className={
                focused ?
                    'tweet__secondary-retweetedby tweet__secondary-retweetedby_focused' :
                    'tweet__secondary-retweetedby'
            }
        >
            <i className="fa fa-retweet"/> <ScreenName user={tw.user}/> <SmallIcon user={tw.user}/>
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
