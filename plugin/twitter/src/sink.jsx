'use strict';

class Tweet extends React.Component {
    constructor(props) {
        super(props);
    }

    build_tweet_component(t) {
        return (
            <div className="ui comments tweet">
                <div className="comment">
                    <a className="avatar" href={"https://twitter.com/" + t.user.screen_name}>
                        <img src={t.user.profile_image_url} />
                    </a>
                    <div className="content">
                        <a className="author" href={"https://twitter.com/" + t.user.screen_name}>
                            @{t.user.screen_name}
                        </a>
                        <div className="metadata">
                            <span className="date created-at">{t.created_at}</span>
                        </div>
                        <div className="text">
                            {t.text}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    build_retweet_component(t, user) {
        return (
            <div className="ui comments tweet">
                <div className="comment">
                    <a className="avatar" href={"https://twitter.com/" + t.user.screen_name}>
                        <img src={t.user.profile_image_url} />
                    </a>
                    <div className="content">
                        <a className="author" href={"https://twitter.com/" + t.user.screen_name}>
                            @{t.user.screen_name}
                        </a>
                        <div className="metadata">
                            <span className="retweeted-by"><i className="fa fa-retweet"></i> Retweeted by @{user.screen_name}</span>
                            <span className="date created-at">{t.created_at}</span>
                        </div>
                        <div className="text">
                            {t.text}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        if ('retweeted_status' in this.props.tweet) {
            return this.build_retweet_component(this.props.tweet.retweeted_status, this.props.tweet.user);
        } else {
            return this.build_tweet_component(this.props.tweet);
        }
    }
}

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
            return <Tweet tweet={json} />;
        }
    }
});

