import * as React from 'react';
import {TwitterUser} from '../item/tweet';
import {openUserTimeline} from '../actions';

interface IconProps extends React.Props<Icon> {
    user: TwitterUser;
    size: number;
    border?: string;
    dispatch: Redux.Dispatch;
}

export default class Icon extends React.Component<IconProps, {}> {
    constructor(props: IconProps) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(e: React.MouseEvent) {
        e.stopPropagation();
        const {dispatch, user} = this.props;
        dispatch(openUserTimeline(user));
    }

    getImageUrl() {
        const {user, size} = this.props;
        if (!user) {
            return '';
        }

        if (size <= 12) {
            return user.icon_url_24x24;
        } else if (size <= 24) {
            return user.mini_icon_url;
        } else if (size <= 48) {
            return user.icon_url;
        } else {
            return user.icon_url_73x73;
        }
    }

    getStyle() {
        const length = this.props.size ? `${this.props.size}px` : 'auto';
        return {
            width: length,
            height: length,
            border: this.props.border,
        };
    }

    render() {
        const user = this.props.user;
        const screen_name = user ? user.screen_name : '';
        return (
            <div
                className="user-icon"
                title={'@' + screen_name}
                onClick={this.onClick}
            >
                <img
                    className="user-icon__inner"
                    src={this.getImageUrl()}
                    alt={screen_name}
                    style={this.getStyle()}
                />
            </div>
        );
    }
}
