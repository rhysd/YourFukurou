import React from "react/addons";
import * as FeedAction from "../feed-actions";
import FeedItem from "./feed-item.jsx";

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
                    expanded: true,
                    source: source_name,
                    stream: stream_name
                });

                let props = i.props;
                props.item_id = item_id;
                added.unshift(
                    <FeedItem key={"feedItem-" + item_id} item_id={item_id} feed_node={React.findDOMNode(this.refs.feed_root)}>
                        <Item {...props}/>
                    </FeedItem>
                );
            }
            const new_children = added.concat(this.state.children);
            this.setState({children: new_children});
        });
    }

    render() {
        return (
            <div className="feed" ref="feed_root">
                <ReactCSSTransitionGroup transitionName="feedNewItem">
                    {this.state.children}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}
