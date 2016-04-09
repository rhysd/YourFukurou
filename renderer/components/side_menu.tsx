import * as React from 'react';
import IconButton from './icon_button';
import Avatar from './avatar';

interface SideMenuProps extends React.Props<any> {
}

const SideMenu = (props: SideMenuProps) => (
    <div className="side-menu">
        <Avatar screenName="Linda_pp" imageUrl="http://pbs.twimg.com/profile_images/3626384430/3a64cf406665c1940d68ab737003605c_normal.jpeg"/>
        <IconButton className="side-menu__button" name="pencil-square-o"/>
        <IconButton className="side-menu__button_active" name="comment-o"/>
        <IconButton className="side-menu__button" name="comments"/>
        <IconButton className="side-menu__button" name="envelope-o"/>
        <IconButton className="side-menu__button" name="search"/>
        <div className="spacer"/>
        <div>
            <IconButton className="side-menu__settings" name="gear"/>
        </div>
    </div>
);
export default SideMenu;
