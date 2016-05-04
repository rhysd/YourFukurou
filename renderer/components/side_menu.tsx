import * as React from 'react';
import {connect} from 'react-redux';
import State from '../states/root';
import IconButton from './icon_button';
import Avatar from './avatar';
import {
    showMessage,
    toggleEditor,
    changeCurrentTimeline,
    notImplementedYet,
} from '../actions';
import {TwitterUser} from '../item/tweet';
import TimelineState from '../states/timeline';
import log from '../log';

interface SideMenuButtonProps extends React.Props<any> {
    active: boolean;
    notified: boolean;
    name: string;
    tip: string;
    onClick: (event?: MouseEvent) => void;
}

const SideMenuButton = (props: SideMenuButtonProps) => (
    <div className="side-menu__button-wrapper">
        <IconButton
            className={props.active ?
                        'side-menu__button side-menu__button_active' :
                        'side-menu__button'}
            name={props.name}
            tip={props.tip}
            onClick={props.onClick}
        />
        <div className="side-menu__button-indicator" style={{opacity: props.notified ? undefined : 0}}/>
    </div>
);

interface SideMenuProps extends React.Props<any> {
    user: TwitterUser;
    timeline: TimelineState;
    dispatch?: Redux.Dispatch;
}

function openConfigWithEditor() {
    'use strict';
    global.require('electron');
    const electron = global.require('electron');
    const config_path = electron.remote.getGlobal('config_path');
    const open = electron.shell.openItem;
    open(config_path);
    log.debug('Open file:', config_path);
}

const SideMenu = (props: SideMenuProps) => (
    <div className="side-menu">
        <Avatar
            screenName={props.user ? props.user.screen_name : ''}
            imageUrl={props.user ? props.user.icon_url : undefined}
            size={48}
        />
        <SideMenuButton
            active
            notified={false}
            name="pencil-square-o"
            tip="New Tweet"
            onClick={() => props.dispatch(toggleEditor())}
        />
        <SideMenuButton
            active={props.timeline.kind === 'home'}
            notified={props.timeline.notified.home}
            name="comment-o"
            tip="Home"
            onClick={() => props.dispatch(changeCurrentTimeline('home'))}
        />
        <SideMenuButton
            active={props.timeline.kind === 'mention'}
            notified={props.timeline.notified.mention}
            name="comments"
            tip="Notifications"
            onClick={() => props.dispatch(changeCurrentTimeline('mention'))}
        />
        <SideMenuButton
            active={false}
            notified={false}
            name="envelope-o"
            tip="Direct Messages"
            onClick={() => props.dispatch(notImplementedYet())}
        />
        <SideMenuButton
            active={false}
            notified={false}
            name="search"
            tip="Search"
            onClick={() => props.dispatch(notImplementedYet())}
        />
        <div className="spacer"/>
        <div>
            <IconButton
                className="side-menu__settings"
                name="gear"
                tip="Settings"
                onClick={openConfigWithEditor}
            />
        </div>
    </div>
);

function select(state: State): SideMenuProps {
    'use strict';
    return {
        user: state.timeline.user,
        timeline: state.timeline,
    };
}
export default connect(select)(SideMenu);
