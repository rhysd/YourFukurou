import * as React from 'react';
import {List} from 'immutable';
import {TwitterUser} from '../../item/tweet';
import {follow, unfollow} from '../../actions';

interface FollowButtonProps extends React.Props<any> {
    user: TwitterUser;
    friends: List<number>;
    dispatch: Redux.Dispatch;
}

function onClick(e: React.MouseEvent, following: boolean, dispatch: Redux.Dispatch, user_id: number) {
    'use strict';
    e.stopPropagation();
    const action = following ? unfollow(user_id) : follow(user_id);
    dispatch(action);
}

const FollowButton: React.StatelessComponent<FollowButtonProps> = props => {
    const following = props.friends.includes(props.user.id);
    const name =
        following ?
            'follow-button follow-button_will-unfollow' :
        props.user.protected ?
            'follow-button follow-button_cannot-follow' :
            'follow-button follow-button_will-follow';
    return (
        <div className={name} onClick={e => onClick(e, following, props.dispatch, props.user.id)}>
            {following ? 'Unfollow' : 'Follow'}
        </div>
    );
};
export default FollowButton;
