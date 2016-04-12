import * as React from 'react';
const openExternal = global.require('electron').shell.openExternal;

export function openExternalLink(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    let target = event.target as Node;
    while (target !== null) {
        const t = target as HTMLAnchorElement;
        if (t.href !== undefined && t.className.indexOf("external-link") !== -1) {
            openExternal(t.href);
            return;
        }
        target = target.parentNode;
    }
    console.log("_openExternalLink: Unexpected link", event.target);
}

interface ExternalLinkProps extends React.Props<any> {
    url: string;
    color?: string;
    title?: string;
}

const ExternalLink = (props: ExternalLinkProps) => (
    <a
        className="external-link"
        href={props.url}
        style={{color: props.color}}
        title={props.title}
        onClick={openExternalLink}
    >
        {props.children}
    </a>
);
export default ExternalLink;
