import * as React from 'react';
const remote = global.require('electron').remote;

interface AvatarProps extends React.Props<any> {
    screenName: string;
    imageUrl?: string;
}

const Avatar = (props: AvatarProps) => (
    <div className="avatar" onClick={() => remote.shell.openExternal(`https://twitter.com/${props.screenName}`)}>
        <img className="avatar__inner" src={props.imageUrl}/>
    </div>
);

export default Avatar;
