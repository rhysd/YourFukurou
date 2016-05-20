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
import {TimelineKind, Notified} from '../states/timeline';
import log from '../log';

interface SideMenuButtonProps extends React.Props<any> {
    active: boolean;
    notified: boolean;
    name: string;
    tip: string;
    onClick: (event: React.MouseEvent) => void;
}

const SideMenuButton = (props: SideMenuButtonProps) => {
    const indicator_props =
        props.notified ? {
                className: 'side-menu__button-indicator animated slideInRight'
            } : {
                className: 'side-menu__button-indicator',
                style: {opacity: 0},
            };
    return (
        <div className="side-menu__button-wrapper">
            <IconButton
                className={props.active ?
                            'side-menu__button side-menu__button_active' :
                            'side-menu__button'}
                name={props.name}
                tip={props.tip}
                onClick={props.onClick}
            />
            <div {...indicator_props}/>
        </div>
    );
};

interface SideMenuProps extends React.Props<any> {
    user: TwitterUser;
    kind: TimelineKind;
    notified: Notified;
    editor_open: boolean;
    dispatch?: Redux.Dispatch;
}

function openConfigWithEditor() {
    'use strict';
    const electron = global.require('electron');
    const config_path = electron.remote.getGlobal('config_path');
    const open = electron.shell.openItem;
    open(config_path);
    log.debug('Open file:', config_path);
}

const SideMenu = (props: SideMenuProps) => {
    const {kind, user, notified, dispatch, editor_open} = props;
    return (
        <div className="side-menu">
            <Avatar
                screenName={user ? user.screen_name : ''}
                imageUrl={user ? user.icon_url : undefined}
                size={48}
            />
            <SideMenuButton
                active={editor_open}
                notified={false}
                name="pencil-square-o"
                tip="New Tweet"
                onClick={() => dispatch(toggleEditor())}
            />
            <SideMenuButton
                active={kind === 'home'}
                notified={notified.home}
                name="home"
                tip="Home"
                onClick={() => dispatch(changeCurrentTimeline('home'))}
            />
            <SideMenuButton
                active={kind === 'mention'}
                notified={notified.mention}
                name="comments"
                tip="Notifications"
                onClick={() => dispatch(changeCurrentTimeline('mention'))}
            />
            <SideMenuButton
                active={false}
                notified={false}
                name="envelope-o"
                tip="Direct Messages"
                onClick={() => dispatch(notImplementedYet())}
            />
            <SideMenuButton
                active={false}
                notified={false}
                name="search"
                tip="Search"
                onClick={() => dispatch(notImplementedYet())}
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
}

function select(state: State): SideMenuProps {
    'use strict';
    return {
        user: state.timeline.user,
        kind: state.timeline.kind,
        notified: state.timeline.notified,
        editor_open: state.editor.is_open,
    };
}
export default connect(select)(SideMenu);
