import React from "react";

export default class Feed extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            children: []
        };

        for (const source_name in this.props.sources) {
            for (const streams of this.props.sources[source_name]) {
                for (const stream_name in streams) {
                    console.log('Feed: registered: ' + source_name + '-' + stream_name);
                    this.props.router.registerRenderer(source_name, stream_name, new_item => {
                        const added = this.state.children.length !== 0 ? [new_item, <div className="ui divider"></div>] : [new_item];
                        const new_children = added.concat(this.state.children);
                        this.setState({children: new_children});
                    });
                }
            }
        }
    }

    render() {
        return (
            <div className="feed">
                {this.state.children}
            </div>
        );
    }
}
