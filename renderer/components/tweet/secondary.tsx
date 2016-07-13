import * as React from 'react';
import * as classNames from 'classnames';
import Tweet from '../../item/tweet';
import ScreenName from './screen_name';
import Icon from '../icon';

interface TweetSecondaryProps extends React.Props<any> {
    status: Tweet;
    focused?: boolean;
}

function retweetedBy(tw: Tweet, focused: boolean) {
    if (!tw.isRetweet()) {
        return undefined;
    }

    return (
        <div
            className={classNames(
                'tweet__secondary-retweetedby',
                {'tweet__secondary-retweetedby_focused': focused},
            )}
        >
            <i className="fa fa-retweet"/> <ScreenName user={tw.user}/> <Icon size={12} user={tw.user}/>
        </div>
    );
}

const TweetSecondary = (props: TweetSecondaryProps) => {
    const focused = !!props.focused;
    const user = props.status.getMainStatus().user;
    return <div className="tweet__secondary">
        <ScreenName
            className={classNames(
                'tweet__secondary-screenname',
                {'tweet__secondary-screenname_focused': focused},
            )}
            user={user}
        />
        <div className="tweet__secondary-name" title={user.name}>
            {user.name}
        </div>
        {retweetedBy(props.status, focused)}
    </div>;
};
export default TweetSecondary;
