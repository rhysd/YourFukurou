import Tweet from "./components/tweet.jsx";
import * as Actions from "./actions";
import * as Menu from "./components/menu.jsx";

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
        "d": "TwitterDumpCurrentStatus",
        "p": "TwitterTogglePreview",
        "r": "TwitterSendReply",
        "t": "TwitterSendTweet"
    },

    action_map: {
        TwitterSendReply: Actions.sendReply,
        TwitterSendTweet: Actions.sendTweet,
        TwitterOpenLinksInTweet: Actions.openLinks,
        TwitterDumpCurrentStatus: Actions.dumpCurrentStatus,
        TwitterTogglePreview: Actions.togglePreview
    },

    menu: {
        item: Menu.getMenuItem(),
        body: Menu.getMenuBody()
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

