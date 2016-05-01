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
import {TimelineKind} from '../states/timeline';

interface SideMenuProps extends React.Props<any> {
    user: TwitterUser;
    timeline: TimelineKind;
    dispatch?: Redux.Dispatch;
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
            className={props.timeline === 'home' ?
                       'side-menu__button side-menu__button_active' :
                       'side-menu__button'}
            name="comment-o"
            tip="Home"
            onClick={() => props.dispatch(changeCurrentTimeline('home'))}
        />
        <IconButton
            className={props.timeline === 'mention' ?
                       'side-menu__button side-menu__button_active' :
                       'side-menu__button'}
            name="comments"
            tip="Notifications"
            onClick={() => props.dispatch(changeCurrentTimeline('mention'))}
        />
        <IconButton
            className="side-menu__button"
            name="envelope-o"
            tip="Direct Messages"
            onClick={() => props.dispatch(notImplementedYet())}
        />
        <IconButton
            className="side-menu__button"
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
                onClick={() => props.dispatch(notImplementedYet())}
            />
        </div>
    </div>
);

function select(state: State): SideMenuProps {
    'use strict';
    return {
        user: state.timeline.user,
        timeline: state.timeline.kind,
    };
}
export default connect(select)(SideMenu);
