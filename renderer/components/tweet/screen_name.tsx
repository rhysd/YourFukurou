import * as React from 'react';
import ExternalLink from '../external_link';
import {TwitterUser} from '../../item/tweet';

interface ScreenNameProps extends React.Props<any> {
    user: TwitterUser;
    className?: string;
}

const ScreenName = (props: ScreenNameProps) => {
    const screen_name = '@' + props.user.screen_name;
    return (
        <span className="tweet__screen-name">
            <ExternalLink
                className={props.className}
                url={props.user.userPageUrl()}
                title={screen_name}
            >
                {screen_name}
            </ExternalLink>
            {props.user.protected
                ? <i className="fa fa-lock" style={{marginLeft: '4px'}}/>
                : undefined}
        </span>
    );
};
export default ScreenName;
