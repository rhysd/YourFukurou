import * as React from 'react';
import * as classNames from 'classnames';
import {TwitterUser} from '../../item/tweet';

interface MiniTweetIconProps extends React.Props<any> {
    readonly user: TwitterUser;
    readonly quoted: boolean;
}

const MiniTweetIcon = (props: MiniTweetIconProps) => {
    const u = props.user;
    const s = '@' + u.screen_name;

    return (
        <div
            className="mini-tweet__icon"
            title={u.name}
        >
            <img
                className={classNames(
                    'mini-tweet__icon-image',
                    {'mini-tweet__icon-image_2cols': props.quoted},
                )}
                src={u.icon_url_73x73}
                alt={s}
                width={48}
                height={48}
            />
        </div>
    );
};
export default MiniTweetIcon;
