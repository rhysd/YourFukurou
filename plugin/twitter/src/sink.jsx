'use strict';

class Tweet extends React.Component {
    constructor(props) {
        super(props);
    }

    buildRetweetedByComponent() {
        if (!('retweeted_status' in this.props.tweet)) {
            return <span className="retweeted-by"></span>;
        }

        return (
            <span className="retweeted-by">
                <i className="fa fa-retweet"></i> Retweeted by {this.buildUserNameComponent(this.props.tweet.user)}
            </span>
        );
    }

    makeCreatedAtLabel(tw) {
        if (tw.created_at === undefined) {
            return "";
        }
        var d = new Date(tw.created_at);
        return `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)} ${d.getMonth()+1}/${d.getDate()} ${d.getYear() + 1900}`;
    }

    buildUserNameComponent(user) {
        return (
            <span className="tweet-username">
                @{user.screen_name}{user.protected ? <i className="fa fa-lock lock-icon"></i> : ""}
            </span>
        );
    }

    render() {
        const tw = this.props.tweet.retweeted_status || this.props.tweet;

        return (
            <div className="ui comments tweet">
                <div className="comment">
                    <a className="avatar" href={"https://twitter.com/" + tw.user.screen_name}>
                        <img src={tw.user.profile_image_url} />
                    </a>
                    <div className="content">
                        <div className="secondary">
                            <a className="author" href={"https://twitter.com/" + tw.user.screen_name}>
                                {this.buildUserNameComponent(tw.user)}
                            </a>
                            <div className="metadata tweet-info">
                                {this.buildRetweetedByComponent()}
                                <span className="date created-at">{this.makeCreatedAtLabel(tw)}</span>
                            </div>
                        </div>
                        <div className="text">
                            {tw.text}
                        </div>
                    </div>
                </div>
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

