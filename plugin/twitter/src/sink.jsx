import Tweet from "./tweet-component.jsx";

// Note:
// Do not execute heavy process here.
// It should be done in 'init' hook.
StreamApp.dispatcher.registerSink({
    source: "twitter",

    stylesheets: [
        "style.css"
    ],

    // initialize: function() {
        // Initialize UI here
    // },

    streams: {
        tweet: function(json) {
            return <Tweet tweet={json} key={json.id_str}/>;
        },

        tweets: function(json_array) {
            return json_array.map(json => <Tweet tweet={json} key={json.id_str}/>)
        }
    }
});

