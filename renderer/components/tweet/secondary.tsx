import * as React from 'react';
import Tweet, {TwitterUser} from '../../item/tweet';
import ScreenName from './screen_name';
import Icon from '../icon';

interface TweetSecondaryProps extends React.Props<any> {
    status: Tweet;
    focused?: boolean;
    dispatch: Redux.Dispatch;
}

function retweetedBy(tw: Tweet, focused: boolean, dispatch: Redux.Dispatch) {
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
            <i className="fa fa-retweet"/> <ScreenName user={tw.user}/> <Icon size={12} user={tw.user} dispatch={dispatch}/>
        </div>
    );
}

const TweetSecondary = (props: TweetSecondaryProps) => {
    const {status, focused, dispatch} = props;
    const user = status.getMainStatus().user;
    return <div className="tweet__secondary">
        <ScreenName
            className={focused ?
                        'tweet__secondary-screenname tweet__secondary-screenname_focused' :
                        'tweet__secondary-screenname'}
            user={user}
        />
        <div className="tweet__secondary-name" title={user.name}>
            {user.name}
        </div>
        {retweetedBy(status, focused, dispatch)}
    </div>;
};
export default TweetSecondary;
