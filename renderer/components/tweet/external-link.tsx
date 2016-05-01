import * as React from 'react';
import log from '../../log';

const openExternal = global.require('electron').shell.openExternal;

export function openExternalLink(event: MouseEvent) {
    'use strict';
    event.preventDefault();
    event.stopPropagation();
    let target = event.target as Node;
    while (target !== null) {
        const t = target as HTMLAnchorElement;
        if (t.href !== undefined && t.className.indexOf('external-link') !== -1) {
            openExternal(t.href);
            return;
        }
        target = target.parentNode;
    }
    log.error('openExternalLink: Unexpected link', event.target);
}

export function openExternalLinkWithClass(className: string, event: MouseEvent) {
    'use strict';
    event.preventDefault();
    event.stopPropagation();
    let target = event.target as Node;
    while (target !== null) {
        const t = target as HTMLAnchorElement;
        if (t.href !== undefined && t.className.indexOf(className) !== -1) {
            openExternal(t.href);
            return;
        }
        target = target.parentNode;
    }
    log.error('openExternalLink: Unexpected link', event.target);
}


interface ExternalLinkProps extends React.Props<any> {
    url: string;
    className?: string;
    color?: string;
    title?: string;
}

const ExternalLink = (props: ExternalLinkProps) => (
    <a
        className={props.className || 'external-link'}
        href={props.url}
        style={{color: props.color}}
        title={props.title}
        onClick={openExternalLinkWithClass.bind(null, props.className || 'external-link')}
    >
        {props.children}
    </a>
);
export default ExternalLink;
