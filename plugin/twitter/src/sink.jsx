import Tweet from "./tweet-component.jsx";

// Note:
// Do not execute heavy process here.
// It should be done in 'init' hook.
StreamApp.registerSink({
    source: "twitter",

    stylesheets: [
        "style.css"
    ],

    initialize: function() {
        // TODO: Not implemented yet
        // Initialize UI here
    },

    streams: {
        tweet: function(json) {
            return <Tweet tweet={json} key={"twitter-" + json.id_str}/>;
        }
    }
});

