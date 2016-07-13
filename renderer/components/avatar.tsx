import * as React from 'react';

interface AvatarProps extends React.Props<any> {
    screenName: string;
    imageUrl?: string;
    size?: number;
    border?: string;
    onClick: (e: React.MouseEvent) => void;
}

function getStyle(props: AvatarProps) {
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
        onClick={props.onClick}
        title={'@' + props.screenName}
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
