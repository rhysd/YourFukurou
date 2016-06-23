import * as React from 'react';
import {connect} from 'react-redux';
import {List} from 'immutable';
import {TwitterUser} from '../../item/tweet';
import {follow, unfollow} from '../../actions';

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
            const action = following ? unfollow(props.user.id) : follow(props.user.id);
            dispatch(action);
        },
    };
}

export default connect(null, mapDispatch)(FollowButton);
