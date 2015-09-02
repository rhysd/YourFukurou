import TwitterText from "twitter-text";
import {openExternalLink} from "./external-link.jsx";
import store from "../store";

const openExternal = global.require("shell").openExternal;

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

        this.listener = id => {
            if (id === this.props.item_id) {
                for (const url of this.props.status.entities.urls) {
                    openExternal(url.expanded_url);
                }
            }
        };
        store.on("open-links-received", this.listener);
    }

    componentWillUnmount() {
        if (this.listener) {
            store.removeListener("open-links-received", this.listener);
        }
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
