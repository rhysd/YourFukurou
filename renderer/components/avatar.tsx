import * as React from 'react';
const shell = global.require('electron').shell;

interface AvatarProps extends React.Props<any> {
    screenName: string;
    imageUrl?: string;
    size?: number;
    border?: string;
}

function getStyle(props: AvatarProps) {
    'use strict';
    const length = props.size ? `${props.size}px` : 'auto';
    return {
        width: length,
        height: length,
        border: props.border,
    };
}

const Avatar = (props: AvatarProps) => (
    <div
        className="avatar"
        onClick={e => {
            e.stopPropagation();
            shell.openExternal(`https://twitter.com/${props.screenName}`);
        }}
    >
        <img
            className="avatar__inner"
            src={props.imageUrl}
            alt={props.screenName}
            style={getStyle(props)}
        />
    </div>
);

export default Avatar;
