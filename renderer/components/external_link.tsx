import * as React from 'react';
import log from '../log';

const openExternal = global.require('electron').shell.openExternal;

interface ExternalLinkProps extends React.Props<any> {
    url: string;
    className?: string;
    title?: string;
}

const ExternalLink = (props: ExternalLinkProps) => (
    <span
        className={props.className + ' external-link'}
        title={props.title}
        onClick={e => {
            e.stopPropagation();
            openExternal(props.url);
        }}
    >
        {props.children}
    </span>
);
export default ExternalLink;
