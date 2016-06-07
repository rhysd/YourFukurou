import * as React from 'react';
import {connect} from 'react-redux';
import {TwitterUser} from '../../item/tweet';
import {openUserTimeline} from '../../actions';

interface ConnectedProps extends React.Props<any> {
    user: TwitterUser;
    className?: string;
}

type Props = ConnectedProps & {
    onClick: (e: React.MouseEvent) => void;
}

const ScreenName = (props: Props) => {
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
    (dispatch: Redux.Dispatch, props: ConnectedProps) =>
        Object.assign({
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                dispatch(openUserTimeline(props.user));
            },
        }, props);

export default connect(null, dispatchToProps)(ScreenName);
