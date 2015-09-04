'use strict';

class Count extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="count">
                {this.props.value}
            </div>
        );
    }
}

// Note:
// Do not execute heavy process here.
// It should be done in 'init' hook.
StreamApp.registerSink({
    source: "dummy",

    stylesheets: [
        "style.css"
    ],

    initialize: function() {
        // Initialize something here
    },

    streams: {
        count: function(c) {
            return <Count value={c} />;
        }
    }
});

