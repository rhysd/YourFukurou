import * as React from 'react';
import {connect} from 'react-redux';
import IconButton from './icon_button';
import Avatar from './avatar';
import {showMessage, toggleEditor} from '../actions';
import {TwitterUser} from '../item/tweet';

interface SideMenuProps extends React.Props<any> {
    user: TwitterUser;
    dispatch?: Redux.Dispatch;
}

function notImplementedYet(props: SideMenuProps) {
    props.dispatch(showMessage('Sorry, this feature is not implemented yet.', 'error'));
}

const SideMenu = (props: SideMenuProps) => (
    <div className="side-menu">
        <Avatar
            screenName={props.user ? props.user.screen_name : ''}
            imageUrl={props.user ? props.user.icon_url : undefined}
            size={48}
        />
        <IconButton
            className="side-menu__button side-menu__button_active"
            name="pencil-square-o"
            tip="New Tweet"
            onClick={() => props.dispatch(toggleEditor())}
        />
        <IconButton
            className="side-menu__button side-menu__button_active"
            name="comment-o"
            tip="Home"
        />
        <IconButton
            className="side-menu__button"
            name="comments"
            tip="Notifications"
            onClick={() => notImplementedYet(props)}
        />
        <IconButton
            className="side-menu__button"
            name="envelope-o"
            tip="Direct Messages"
            onClick={() => notImplementedYet(props)}
        />
        <IconButton
            className="side-menu__button"
            name="search"
            tip="Search"
            onClick={() => notImplementedYet(props)}
        />
        <div className="spacer"/>
        <div>
            <IconButton
                className="side-menu__settings"
                name="gear"
                tip="Settings"
                onClick={() => notImplementedYet(props)}
            />
        </div>
    </div>
);
export default connect()(SideMenu);
