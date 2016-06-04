import * as React from 'react';
import {List} from 'immutable';
import TwitterProfile from '../tweet/profile';
import {UserTimeline} from '../../states/slave_timeline';

interface UserSlaveProps extends React.Props<any> {
    timeline: UserTimeline;
    friends: List<number>;
    dispatch: Redux.Dispatch;
}

const UserSlave: React.StatelessComponent<UserSlaveProps> = props => (
    <div className="slave-timeline__user">
        <div className="slave-timeline__user-profile">
            <TwitterProfile
                user={props.timeline.user}
                friends={props.friends}
                size="big"
                dispatch={props.dispatch}
            />
        </div>
    </div>
);

export default UserSlave;
