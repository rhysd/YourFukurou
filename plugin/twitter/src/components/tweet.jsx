import assign from "object-assign";
import TweetText from "./tweet-text.jsx";

const openExternal = global.require("shell").openExternal;
let feed_store = StreamApp.getStore("feed");

function _openExternalLink(event) {
    event.preventDefault();
    let target = event.target;
    while (target !== null) {
        if (target.href !== undefined && target.className.indexOf("external-link") !== -1) {
            openExternal(target.href);
            return;
        }
        target = target.parentNode;
    }
    console.log("_openExternalLink: Unexpected link", event.target);
}

export default class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = feed_store.getItemState(this.props.item_id);
    }

    componentWillUnmount() {
        feed_store.removeListener("item-changed", this.store_listener);
    }

    renderRetweetedByComponent() {
        if (this.props.tweet.retweeted_status === undefined) {
            return <span className="retweeted-by"></span>;
        }

        return (
            <span className="retweeted-by">
                <i className="fa fa-retweet"></i> Retweeted by <a className="external-link" href={"https://twitter.com/" + this.props.tweet.user.screen_name} onClick={_openExternalLink}>
                    <img className="retweet-author" src={this.props.tweet.user.profile_image_url}/>
                </a> {this.renderUserNameComponent(this.props.tweet.user, "retweet-author")}
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

    renderUserNameComponent(user, class_name) {
        return (
            <span className={class_name}>
                @{user.screen_name}{user.protected ? <i className="fa fa-lock lock-icon"></i> : ""}
            </span>
        );
    }

    componentDidMount() {
        this.store_listener = (key, new_state) => {
            if (key === this.props.item_id) {
                this.setState(assign({}, new_state));
            }
        }
        feed_store.on("item-changed", this.store_listener);
    }

    render() {
        const tw = this.props.tweet.retweeted_status || this.props.tweet;

        return (
            <div className="tweet" data-focused={this.state.focused}>
                <div className="avatar">
                    <a className="external-link" href={"https://twitter.com/" + tw.user.screen_name} onClick={_openExternalLink}>
                        <img src={tw.user.profile_image_url} />
                    </a>
                </div>
                <div className="content">
                    <div className="secondary">
                        <a className="external-link" href={"https://twitter.com/" + tw.user.screen_name} onClick={_openExternalLink}>
                            {this.renderUserNameComponent(tw.user, "author")}
                        </a>
                        {this.renderRetweetedByComponent()}
                        <span className="created-at">
                            <a className="external-link tweet-link" href={"https://twitter.com/" + tw.user.screen_name + "/status/" + tw.id_str} onClick={_openExternalLink}>
                                {this.makeCreatedAtLabel(tw)}
                            </a>
                        </span>
                    </div>
                    <TweetText status={tw} />
                </div>
        </div>
        );
    }
}

