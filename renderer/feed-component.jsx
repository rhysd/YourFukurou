import React from "react/addons";
import feed_store from "./feed-store";
import * as FeedAction from "./feed-actions";

let ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

export default class Feed extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            children: []
        };

        this.counter = 0;

        for (const source_name in this.props.sources) {
            for (const streams of this.props.sources[source_name]) {
                for (const stream_name in streams) {
                    this.registerStreamToRouter(source_name, stream_name);
                }
            }
        }
    }

    registerStreamToRouter(source_name, stream_name) {
        console.log("Feed: registered: " + source_name + "-" + stream_name);
        this.props.router.registerRenderer(source_name, stream_name, new_item => {
            let added = [];
            for (const i of new_item instanceof Array ? new_item : [new_item]) {
                const Item = i.component;
                const item_id = this.counter++;
                FeedAction.addItem(item_id, {
                    focused: false,
                    expanded: true
                });

                let props = i.props;
                props.item_id = item_id;
                added.unshift(
                    <div className="feed-item-wrapper" key={"feedItem-" + item_id} data-item-id={item_id} onClick={this.onItemClick.bind(this, item_id)}>
                        <Item {...props}/>
                    </div>
                );
            }
            const new_children = added.concat(this.state.children);
            this.setState({children: new_children});
        });
    }

    onItemClick(item_id) {
        const focused_id = feed_store.getFocusedId();
        if (focused_id !== undefined && focused_id === item_id) {
            console.log("blur!");
            FeedAction.blur();
        } else {
            FeedAction.focusTo(item_id);
        }
    }

    render() {
        return (
            <div className="feed">
                <ReactCSSTransitionGroup transitionName="feedNewItem">
                    {this.state.children}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}
