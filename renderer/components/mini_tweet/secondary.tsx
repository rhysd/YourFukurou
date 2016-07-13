import * as React from 'react';
import * as classNames from 'classnames';
import ScreenName from '../tweet/screen_name';
import Tweet from '../../item/tweet';

interface MiniTweetSecondaryProps extends React.Props<any> {
    status: Tweet;
    focused: boolean;
}

function renderRetweeted(props: MiniTweetSecondaryProps) {
    if (!props.status.isRetweet()) {
        return undefined;
    }

    const user = props.status.user;
    const screen_name = '@' + user.screen_name;

    return (
        <div
            className={classNames(
                'mini-tweet__secondary-retweeted',
                {'mini-tweet__secondary-retweeted_focused': props.focused},
            )}
        >
            <i className="fa fa-retweet"/>
            <div className="mini-tweet__secondary-rt-icon" title={screen_name}>
                <img
                    className="mini-tweet__secondary-rt-image"
                    height={24}
                    width={24}
                    src={user.icon_url_24x24}
                    alt={screen_name}
                />
            </div>
        </div>
    );
}

const MiniTweetSecondary = (props: MiniTweetSecondaryProps) => {
    const s = props.status.getMainStatus();
    return (
        <div
            className={classNames(
                'mini-tweet__secondary',
                {'mini-tweet__secondary_2cols': s.isQuotedTweet()},
            )}
        >
            <ScreenName
                className={classNames(
                    'mini-tweet__secondary-screenname',
                    {'mini-tweet__secondary-screenname_focused': props.focused},
                )}
                user={s.user}
            />
            {renderRetweeted(props)}
        </div>
    );
};
export default MiniTweetSecondary;
