import Tweet from "./tweet-component.jsx";

// Note:
// Do not execute heavy process here.
// It should be done in 'init' hook.
StreamApp.router.registerSink({
    source: "twitter",

    stylesheets: [
        "style.css"
    ],

    // initialize: function() {
        // Initialize UI here
    // },

    streams: {
        tweet: function(json) {
            return {
                component: Tweet,
                props: {tweet: json}
            };
        },

        tweets: function(json_array) {
            return json_array.reverse().map(
                json => ({
                    component: Tweet,
                    props: {tweet: json}
                })
            );
        }
    }
});

