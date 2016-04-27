import * as React from 'react';
import ExternalLink from './external-link';
import {TwitterUser} from '../../item/tweet';

interface ScreenNameProps extends React.Props<any> {
    user: TwitterUser;
    color?: string;
    className?: string;
}

const ScreenName = (props: ScreenNameProps) => {
    const screen_name = '@' + props.user.screen_name;
    return (
        <span className={props.className}>
            <ExternalLink
                url={props.user.userPageUrl()}
                color={props.color}
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
