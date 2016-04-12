import * as React from 'react';
const remote = global.require('electron').remote;

interface AvatarProps extends React.Props<any> {
    screenName: string;
    imageUrl: string;
    size?: number;
    border?: string;
}

function getStyle(props: AvatarProps) {
    const length = props.size ? `${props.size}px` : 'auto';
    const border = props.border ? `1px solid ${props.border}` : undefined;
    return {
        width: length,
        height: length,
        border,
    };
}

const Avatar = (props: AvatarProps) => (
    <div
        className="avatar"
        onClick={() => remote.shell.openExternal(`https://twitter.com/${props.screenName}`)}
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
