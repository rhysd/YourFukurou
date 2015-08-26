import React from "react/addons";
import Feed from "./feed-component.jsx";

export default class Root extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let sources = {};
        for (const sink of this.props.router.sinks) {
            if (!(sink.source in sources)) {
                sources[sink.source] = [sink.streams];
            } else {
                sources[sink.source].push(sink.streams);
            }
        }

        // TODO: Now there is only one feed
        return (
            <div className="root">
                <Feed sources={sources} router={this.props.router} />
            </div>
        );
    }
}
