'use strict';

class Tweet extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="tweet">
                {this.props.raw_json}
            </div>
        );
    }
}

// Note:
// Do not execute heavy process here.
// It should be done in 'init' hook.
StreamApp.registerSink({
    source: "twitter",

    stylesheets: [
    ],

    initialize: function() {
        // TODO: Not implemented yet
        // Initialize UI here
    },

    streams: {
        tweet: function(json) {
            return <Tweet raw_json={JSON.stringify(json, null, 2)} />;
        }
    }
});

