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
        if (document.body.scrollTop !== 0) {
            // Note: 1 for divisor
            window.scrollBy(0, this.refs.item_root.getDOMNode().clientHeight + 1);
        }

        this.focused = (key, new_state) => {
            if (key !== this.props.item_id) {
                return;
            }

            const node = this.refs.item_root.getDOMNode();

            const node_top = node.offsetTop;
            const window_top = document.body.scrollTop;
            const node_bottom = node_top + node.clientHeight;
            const window_bottom = window_top + window.innerHeight;

            if (node_bottom > window_bottom) {
                window.scrollBy(0, node_bottom - window_bottom);
            } else if (window_top > node_top) {
                window.scrollBy(0, node_top - window_top);
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

