import * as React from 'react';
import {connect} from 'react-redux';
import IconButton from './icon_button';
import Avatar from './avatar';
import {showMessage} from '../actions';

interface SideMenuProps extends React.Props<any> {
    dispatch?: Redux.Dispatch;
}

function notImplementedYet(props: SideMenuProps) {
    props.dispatch(showMessage('Sorry, this feature is not implemented yet.', 'error'));
}

const SideMenu = (props: SideMenuProps) => (
    <div className="side-menu">
        <Avatar
            screenName="Linda_pp"
            imageUrl={window.devicePixelRatio >= 1.5 ?
                "http://pbs.twimg.com/profile_images/3626384430/3a64cf406665c1940d68ab737003605c_bigger.jpeg" :
                "http://pbs.twimg.com/profile_images/3626384430/3a64cf406665c1940d68ab737003605c_normal.jpeg"}
            size={48}
        />
        <IconButton
            className="side-menu__button"
            name="pencil-square-o"
            tip="New Tweet"
            onClick={() => notImplementedYet(props)}
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
