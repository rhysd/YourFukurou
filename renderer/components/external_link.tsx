import * as React from 'react';

const openExternal = global.require('electron').shell.openExternal;

interface ExternalLinkProps extends React.Props<any> {
    readonly url: string;
    readonly className?: string;
    readonly title?: string;
}

export default class ExternalLink extends React.Component<ExternalLinkProps, {}> {
    handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        openExternal(this.props.url);
    }

    render() {
        const {className, title, children} = this.props;
        return (
            <span
                className={className + ' external-link'}
                title={title}
                onClick={this.handleClick}
            >
                {children}
            </span>
        );
    }
}
