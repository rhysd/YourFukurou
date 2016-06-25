import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {TwitterUser} from '../../item/tweet';
import {showMessage} from '../../actions';
import TwitterRestApi from '../../twitter/rest_api';

interface ConnectedProps extends React.Props<any> {
    user: TwitterUser;
    friends: List<number>;
}

interface DispatchProps {
    onClick: (e: React.MouseEvent) => void;
}

type FollowButtonProps = ConnectedProps & DispatchProps;

export const FollowButton: React.StatelessComponent<FollowButtonProps> = props => {
    const following = props.friends.includes(props.user.id);
    const modifier =
        following ?
            'follow-button_will-unfollow' :
        props.user.protected ?
            'follow-button_cannot-follow' :
            'follow-button_will-follow';
    return (
        <div className={'follow-button ' + modifier} onClick={props.onClick}>
            {following ? 'Unfollow' : 'Follow'}
        </div>
    );
};

function mapDispatch(dispatch: Redux.Dispatch, props: ConnectedProps): DispatchProps {
    return {
        onClick: e => {
            e.stopPropagation();
            const following = props.friends.includes(props.user.id);
            if (following) {
                TwitterRestApi.unfollow(props.user.id)
                    .then(u => dispatch(showMessage(`Unfollowed @${u.screen_name}`, 'info')));
            } else {
                TwitterRestApi.follow(props.user.id)
                    .then(u => dispatch(showMessage(`Followed @${u.screen_name}`, 'info')));
            }
        },
    };
}

export default connect(null, mapDispatch)(FollowButton);
