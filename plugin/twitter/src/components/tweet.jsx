import assign from "object-assign";
import TweetText from "./tweet-text.jsx";
import QuotedTweet from "./quoted-tweet.jsx";
import ImagePreview from "./image-preview.jsx";
import ExternalLink, {openExternalLink} from "./external-link.jsx";
import store from "../store";

let feed_store = StreamApp.getStore("feed");

export default class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = feed_store.getItemState(this.props.item_id);
    }

    renderRetweetedByComponent() {
        if (this.props.tweet.retweeted_status === undefined) {
            return <span className="retweeted-by"></span>;
        }

        return (
            <span className="retweeted-by">
                <i className="fa fa-retweet"></i> Retweeted by <ExternalLink url={"https://twitter.com/" + this.props.tweet.user.screen_name}>
                    <img className="retweet-author" src={this.props.tweet.user.profile_image_url}/>
                </ExternalLink> {this.renderUserNameComponent(this.props.tweet.user, "retweet-author")}
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
        this.item_changed_listener = (key, new_state) => {
            if (key === this.props.item_id) {
                this.setState(assign({}, new_state));
            }
        }
        feed_store.on("item-changed", this.item_changed_listener);

        this.dump_current_status_received_listener = id => {
            if (id === this.props.item_id) {
                console.log("DumpCurrentStatus: " + id);
                console.log(JSON.stringify(this.props.tweet, null, 2));
            }
        };
        store.on("dump-current-status-received", this.dump_current_status_received_listener);
    }

    componentWillUnmount() {
        feed_store.removeListener("item-changed", this.item_changed_listener);
        feed_store.removeListener("dump-current-status-received", this.dump_current_status_received_listener);
    }

    renderMedia(status) {
        if (status.extended_entities !== undefined && status.extended_entities.media !== undefined) {
            return <ImagePreview media={status.extended_entities.media} item_id={this.props.item_id}/>;
        }

        if (status.entities.media !== undefined) {
            return <ImagePreview media={status.entities.media} item_id={this.props.item_id}/>;
        }

        return "";
    }

    // TODO: Make component
    renderIconCounter(icon_name, color, count) {
        if (count > 1000000) {
            var count_str = (Math.floor(count / 10) / 100000) + "M";
        } else if (count > 1000) {
            // Note: Remove after first decimal place by `floor(count / 1000 * 100) / 100`
            var count_str = (Math.floor(count / 10) / 100) + "K";
        } else {
            var count_str = count.toString();
        }

        return (
            <span className="icon-counter" style={{color: color}}>
                <i className={"fa " + icon_name} /> {" " + count_str}
            </span>
        );
    }

    render() {
        const tw = this.props.tweet.retweeted_status || this.props.tweet;

        return (
            <div className="tweet" data-focused={this.state.focused}>
                <div className="avatar">
                    <ExternalLink url={"https://twitter.com/" + tw.user.screen_name}>
                        <img src={tw.user.profile_image_url} />
                    </ExternalLink>
                </div>
                <div className="content">
                    <div className="secondary">
                        <ExternalLink url={"https://twitter.com/" + tw.user.screen_name}>
                            {this.renderUserNameComponent(tw.user, "author")}
                        </ExternalLink>
                        {this.renderRetweetedByComponent()}
                        <span className="created-at">
                            {this.renderIconCounter("fa-star", tw.favorited ? "orange" : "", tw.favorite_count)}
                            {this.renderIconCounter("fa-retweet", tw.retweeted ? "darkgreen" : "", tw.retweet_count)}
                            <ExternalLink className="tweet-link" url={"https://twitter.com/" + tw.user.screen_name + "/status/" + tw.id_str}>
                                {this.makeCreatedAtLabel(tw)}
                            </ExternalLink>
                        </span>
                    </div>
                    <TweetText status={tw} item_id={this.props.item_id}/>
                    {tw.quoted_status ? <QuotedTweet tweet={tw.quoted_status}/> : ""}
                    {this.renderMedia(tw)}
                </div>
            </div>
        );
    }
}

