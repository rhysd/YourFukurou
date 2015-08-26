const openExternal = global.require("shell").openExternal;
let feed_store = StreamApp.getStore("feed");

class ExternalLink extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <a className={"external-link " + (this.props.role || "")} onClick={() => openExternal(this.props.url)}>
                {this.props.children}
            </a>
        );
    }
}

// TODO: Analyze #hash
class TweetTextBuilder {
    constructor(tweet) {
        let e = document.createElement('div');
        e.innerHTML = tweet.text;
        this.text = e.innerText;
        this.built = [];
        this.urls = tweet.entities.urls || [];
        this.hashtags = tweet.entities.hashtags || [];
        this.id = 0;
        this.regex_dist = /@\w+|https?:\/\/t.co\/\w+|#./;
    }

    is_eof() {
        return this.text === '';
    }

    buildTextLink(url) {
        for (const u of this.urls) {
            if (u.url === url) {
                return <ExternalLink role="text-link" url={u.expanded_url} key={this.id++}>{u.display_url}</ExternalLink>;
            }
        }
        return <ExternalLink role="text-link" url={url} key={this.id++}>{url}</ExternalLink>;
    }

    getHashTag(index) {
        for (const h of this.hashtags) {
            if (this.text.startsWith(h.text, index + 1)) {
                return h.text;
            }
        }
        return "";
    }

    eat() {
        const m = this.text.match(this.regex_dist);
        if (m === null) {
            this.built.push(<span key={this.id++}>{this.text}</span>);
            this.text = '';
            return;
        }

        if (m.index !== 0) {
            this.built.push(<span key={this.id++}>{this.text.substr(0, m.index)}</span>);
        }

        if (m[0][0] === '#') {
            const hashtag = this.getHashTag(m.index);
            this.built.push(<ExternalLink role={"hashtag-link"} url={"https://twitter.com/search?q=%23" + hashtag} key={this.id++}>#{hashtag}</ExternalLink>);
            this.text = this.text.substring(m.index + hashtag.length + 1/*#*/)
            return;
        }

        if (m[0].startsWith('@')) {
            this.built.push(<ExternalLink role="user-link" url={"https://twitter.com/" + m[0].substr(1)} key={this.id++}>{m[0]}</ExternalLink>);
        } else if (m[0].startsWith('http')) {
            this.built.push(this.buildTextLink(m[0]));
        } else {
            console.log('<TweetTextBuilder>: Invalid match: ' + m[0]);
        }

        this.text = this.text.substring(m[0].length + m.index);
    }

    build() {
        while (!this.is_eof()) {
            this.eat();
        }
        return this.built;
    }
}

export default class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {item_status: feed_store.getItem(this.props.item_id)};
    }

    buildRetweetedByComponent() {
        if (this.props.tweet.retweeted_status === undefined) {
            return <span className="retweeted-by"></span>;
        }

        return (
            <span className="retweeted-by">
                <i className="fa fa-retweet"></i> Retweeted by <ExternalLink role="retweeter" url={"https://twitter.com/" + this.props.tweet.user.screen_name}>
                    <img className="retweeter-avatar" src={this.props.tweet.user.profile_image_url}/>
                </ExternalLink> {this.buildUserNameComponent(this.props.tweet.user)}
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
                    <ExternalLink role="avatar" url={"https://twitter.com/" + tw.user.screen_name}>
                        <img src={tw.user.profile_image_url} />
                    </ExternalLink>
                    <div className="content">
                        <div className="secondary">
                            <ExternalLink role="author" url={"https://twitter.com/" + tw.user.screen_name}>
                                {this.buildUserNameComponent(tw.user)}
                            </ExternalLink>
                            <div className="metadata tweet-info">
                                {this.buildRetweetedByComponent()}
                                <span className="date created-at">
                                    <ExternalLink role="tweet-link" url={"https://twitter.com/" + tw.user.screen_name + "/status/" + tw.id_str}>
                                        {this.makeCreatedAtLabel(tw)}
                                    </ExternalLink>
                                </span>
                            </div>
                        </div>
                        <div className="text tweet-text">
                            {(new TweetTextBuilder(tw)).build()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

