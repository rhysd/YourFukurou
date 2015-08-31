import assign from "object-assign";
import TweetText from "./tweet-text.jsx";
import ExternalLink, {openExternalLink} from "./external-link.jsx";
import * as Action from "../actions";
import StatusStore from "../store";

let feed_store = StreamApp.getStore("feed");

export default class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = feed_store.getItemState(this.props.item_id);
        Action.addStatus(this.props.item_id, this.props.tweet);
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
        this.store_listener = (key, new_state) => {
            if (key === this.props.item_id) {
                this.setState(assign({}, new_state));
            }
        }
        feed_store.on("item-changed", this.store_listener);
    }

    componentWillUnmount() {
        feed_store.removeListener("item-changed", this.store_listener);
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
                            <ExternalLink className="tweet-link" url={"https://twitter.com/" + tw.user.screen_name + "/status/" + tw.id_str}>
                                {this.makeCreatedAtLabel(tw)}
                            </ExternalLink>
                        </span>
                    </div>
                    <TweetText status={tw} />
                </div>
        </div>
        );
    }
}

