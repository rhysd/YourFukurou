import * as React from 'react';
import IconButton from './icon_button';
import Avatar from './avatar';

interface SideMenuProps extends React.Props<any> {
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
        <IconButton className="side-menu__button" name="pencil-square-o" tip="New Tweet"/>
        <IconButton className="side-menu__button_active" name="comment-o" tip="Home"/>
        <IconButton className="side-menu__button" name="comments" tip="Notifications"/>
        <IconButton className="side-menu__button" name="envelope-o" tip="Direct Messages"/>
        <IconButton className="side-menu__button" name="search" tip="Search"/>
        <div className="spacer"/>
        <div>
            <IconButton className="side-menu__settings" name="gear" tip="Settings"/>
        </div>
    </div>
);
export default SideMenu;
