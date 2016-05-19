import * as React from 'react';
import {List} from 'immutable';
import {TwitterUser} from '../../item/tweet';

interface FollowButtonProps extends React.Props<any> {
    user: TwitterUser;
    friends: List<number>;
}

function onClick(e: React.MouseEvent) {
    'use strict';
    e.stopPropagation();
    console.error('TODO');
}

const FollowButton: React.StatelessComponent<FollowButtonProps> = props => {
    const following = props.friends.includes(props.user.id);
    const name =
        following ?
            'follow-button follow-button_will-unfollow' :
            'follow-button follow-button_will-follow';
    return <div className={name} onClick={e => onClick(e)}>
        {following ? 'Unfollow' : 'Follow'}
    </div>
};
export default FollowButton;
