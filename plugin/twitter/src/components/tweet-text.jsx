import TwitterText from "twitter-text";

const openExternal = global.require("shell").openExternal;

function _openExternalLink(event) {
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

export default class TweetText extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const body_node = this.refs.body_node.getDOMNode();
        const forEach = Array.prototype.forEach;
        forEach.call(body_node.querySelectorAll("a"), anchor => {
            anchor.className = "external-link";
            anchor.onclick = _openExternalLink;
        });
    }

    buildAutoLinkedHTML(status) {
        return TwitterText.autoLink(status.text, {urlEntities: status.entities.urls});
    }

    render() {
        return (
            <div className="tweet-text" ref="body_node" dangerouslySetInnerHTML={{__html: this.buildAutoLinkedHTML(this.props.status)}} />
        );
    }
}
