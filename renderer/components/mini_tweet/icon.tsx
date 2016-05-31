import * as React from 'react';
import {TwitterUser} from '../../item/tweet';

interface MiniTweetIconProps extends React.Props<any> {
    user: TwitterUser;
    quoted: boolean;
}

const MiniTweetIcon: React.StatelessComponent<MiniTweetIconProps> = props => {
    const u = props.user;
    const s = '@' + u.screen_name;

    return (
        <div
            className="mini-tweet__icon"
            title={u.name}
        >
            <img
                className={
                    props.quoted ?
                        'mini-tweet__icon-image mini-tweet__icon-image_2cols' :
                        'mini-tweet__icon-image'
                }
                src={u.icon_url_73x73}
                alt={s}
                width={48}
                height={48}
            />
        </div>
    );
};
export default MiniTweetIcon;
