const openExternal = global.require("shell").openExternal;

export function openExternalLink(event) {
    event.preventDefault();
    let target = event.target;
    while (target !== null) {
        if (target.href !== undefined && target.className.indexOf("external-link") !== -1) {
            openExternal(target.href);
            return;
        }
        target = target.parentNode;
    }
    console.log("_openExternalLink: Unexpected link", event.target);
}

export default class ExternalLink extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <a className="external-link" href={this.props.url} onClick={openExternalLink}>
                {this.props.children}
            </a>
        );
    }
}
