import * as React from 'react';
import {connect} from 'react-redux';
import * as classNames from 'classnames';
import State from '../states/root';
import IconButton from './icon_button';
import Icon from './icon';
import {toggleEditor} from '../actions/editor';
import {changeCurrentTimeline} from '../actions/timeline';
import {TwitterUser} from '../item/tweet';
import {TimelineKind, Notified} from '../states/timeline';
import log from '../log';
import {Dispatch} from '../store';

const {shell} = global.require('electron');

// Note:
// In OS X, title bar is hidden and we need to allocate the space for insets of window.
// Otherwise, natural padding is added at the top of side menu.
const TitleBarInsetPadding = {
    paddingTop: global.process.platform === 'darwin' ? '32px' : '12px',
};

interface SideMenuButtonProps extends React.Props<any> {
    readonly active: boolean;
    readonly notified: boolean;
    readonly name: string;
    readonly tip: string;
    readonly onClick: (event: React.MouseEvent) => void;
}

export const SideMenuButton = (props: SideMenuButtonProps) => {
    const indicator_props =
        props.notified ? {
                className: 'side-menu__button-indicator animated slideInRight',
            } : {
                className: 'side-menu__button-indicator',
                style: {opacity: 0},
            };
    return (
        <div className="side-menu__button-wrapper">
            <IconButton
                className={classNames(
                    'side-menu__button',
                    {'side-menu__button_active': props.active},
                )}
                name={props.name}
                tip={props.tip}
                onClick={props.onClick}
            />
            <div {...indicator_props}/>
        </div>
    );
};

interface Props extends React.Props<any> {
    user: TwitterUser;
    kind: TimelineKind;
    notified: Notified;
    editor_open: boolean;
    onEdit: () => void;
    onHome: () => void;
    onMention: () => void;
}

function openConfigWithEditor() {
    const electron = global.require('electron');
    const config_path = electron.remote.getGlobal('config_path');
    const open = electron.shell.openItem;
    open(config_path);
    log.debug('Open file:', config_path);
}

function openDirectMessagePage() {
    shell.openExternal('https://twitter.com/messages');
}

function openSearchPage() {
    shell.openExternal('https://twitter.com/search-home');
}

export const SideMenu = (props: Props) => {
    const {kind, user, notified, editor_open, onEdit, onHome, onMention} = props;
    return (
        <div className="side-menu" style={TitleBarInsetPadding}>
            <Icon size={48} user={user}/>
            <SideMenuButton
                active={editor_open}
                notified={false}
                name="pencil-square-o"
                tip="New Tweet"
                onClick={onEdit}
            />
            <SideMenuButton
                active={kind === 'home'}
                notified={notified.home}
                name="home"
                tip="Home"
                onClick={onHome}
            />
            <SideMenuButton
                active={kind === 'mention'}
                notified={notified.mention}
                name="comments"
                tip="Notifications"
                onClick={onMention}
            />
            <SideMenuButton
                active={false}
                notified={false}
                name="envelope-o"
                tip="Direct Messages"
                onClick={openDirectMessagePage}
            />
            <SideMenuButton
                active={false}
                notified={false}
                name="search"
                tip="Search"
                onClick={openSearchPage}
            />
            <IconButton
                className="side-menu__settings"
                name="gear"
                tip="Settings"
                onClick={openConfigWithEditor}
            />
        </div>
    );
};

function select(state: State) {
    return {
        user: state.timeline.user,
        kind: state.timeline.kind,
        notified: state.timeline.notified,
        editor_open: state.editor.is_open,
    };
}

function mapDispatch(dispatch: Dispatch) {
    return {
        onEdit: () => {
            dispatch(toggleEditor());
        },
        onHome: () => {
            dispatch(changeCurrentTimeline('home'));
        },
        onMention: () => {
            dispatch(changeCurrentTimeline('mention'));
        },
    };
}

export default connect(
    select,
    mapDispatch,
    (s, d) => Object.assign({}, s, d),
)(SideMenu as React.StatelessComponent<Props>);
