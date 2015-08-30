import TwitterText from "twitter-text";
import {openExternalLink} from "./external-link.jsx";

export default class TweetText extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const body_node = this.refs.body_node.getDOMNode();
        const forEach = Array.prototype.forEach;
        forEach.call(body_node.querySelectorAll("a"), anchor => {
            anchor.className = "external-link";
            anchor.onclick = openExternalLink;
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
