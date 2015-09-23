import React from "react/addons";
import feed_store from "../feed-store";
import * as FeedAction from "../feed-actions";

export default class FeedItem extends React.Component {
    constructor(props) {
        super(props);
    }

    onItemClick() {
        const focused_id = feed_store.getFocusedId();
        if (focused_id !== undefined && focused_id === this.props.item_id) {
            FeedAction.blur();
        } else {
            FeedAction.focusTo(this.props.item_id);
        }
    }

    componentDidMount() {
        // Note:
        // When user is not at top of page, do not scroll by adding new item
        if (this.props.feed_node.scrollTop !== 0) {
            // Note: 1 for divisor
            this.props.feed_node.scrollTop += React.findDOMNode(this.refs.item_root).clientHeight + 1;
        }

        this.focused = (key, new_state) => {
            if (key !== this.props.item_id) {
                return;
            }

            const node = React.findDOMNode(this.refs.item_root);

            const node_top = node.offsetTop;
            const feed_top = this.props.feed_node.scrollTop;
            const node_bottom = node_top + node.clientHeight;
            const feed_bottom = feed_top + window.innerHeight;

            if (node_bottom > feed_bottom) {
                node.scrollIntoView(false);
            } else if (feed_top > node_top) {
                node.scrollIntoView(true);
            }
        };

        feed_store.on("item-focused", this.focused);
    }

    componentWillUnmount() {
        feed_store.removeListener("item-focused", this.focused);
    }

    render() {
        return (
            <div className="feed-item" ref="item_root" onClick={this.onItemClick.bind(this)}>
                {this.props.children}
            </div>
        );
    }
}

