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

    render() {
        return (
            <div className="feed-item" onClick={this.onItemClick.bind(this)}>
                {this.props.children}
            </div>
        );
    }
}

