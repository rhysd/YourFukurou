import Tweet from "./components/tweet.jsx";
import * as Actions from "./actions";

let feed_store = StreamApp.getStore("feed");

// Note:
// Do not execute heavy process here.
// It should be done in 'init' hook.
StreamApp.router.registerSink({
    source: "twitter",

    stylesheets: [
        "style.css",
        "../../bower_components/lightbox2/dist/css/lightbox.css"
    ],

    scripts: [
        "../../bower_components/lightbox2/dist/js/lightbox-plus-jquery.min.js"
    ],

    // initialize: function() {
        // Initialize UI here
    // },

    // TODO: Temporary keymaps (users should determine)
    local_keymaps: {
        "l": "TwitterOpenLinksInTweet",
        "d": "TwitterDumpCurrentStatus"
    },

    action_map: {
        TwitterOpenLinksInTweet: Actions.openLink,
        TwitterDumpCurrentStatus: Actions.dumpCurrentStatus
    },

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

