import * as React from 'react';
import {connect} from 'react-redux';
import Tweet, {TwitterUser} from '../../item/tweet';
import {
    openUserTimeline,
    addUserTweets,
} from '../../actions/slave_timeline';
import TwitterRestApi from '../../twitter/rest_api';
import {Dispatch} from '../../store';

interface ConnectedProps extends React.Props<any> {
    readonly user: TwitterUser;
    readonly className?: string;
}

type Props = ConnectedProps & {
    readonly onClick: (e: React.MouseEvent) => void;
}

export const ScreenName = (props: Props) => {
    const screen_name = '@' + props.user.screen_name;
    return (
        <span className="screenname__body">
            <span
                className={props.className + ' external-link'}
                title={screen_name}
                onClick={props.onClick}
            >
                {screen_name}
            </span>
            {props.user.protected
                ? <i className="fa fa-lock" style={{marginLeft: '4px'}}/>
                : undefined}
        </span>
    );
};

const dispatchToProps =
    (dispatch: Dispatch, props: ConnectedProps) =>
        Object.assign(
            {
                onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    dispatch(openUserTimeline(props.user));
                    TwitterRestApi.userTimeline(props.user.id).then(res => {
                        const action = addUserTweets(props.user.id, res.map(json => new Tweet(json)));
                        window.requestIdleCallback(() => dispatch(action));
                    });
                },
            },
            props,
        );

export default connect(null, dispatchToProps)(ScreenName);
