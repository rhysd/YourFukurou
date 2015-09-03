import assign from "object-assign";
import TweetText from "./tweet-text.jsx";
import QuotedTweet from "./quoted-tweet.jsx";
import ImagePreview from "./image-preview.jsx";
import IconCounter from "./icon-counter.jsx";
import ExternalLink, {openExternalLink} from "./external-link.jsx";
import store from "../store";

let feed_store = StreamApp.getStore("feed");

class UserName extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <span className={this.props.name}>
                @{this.props.user.screen_name}{this.props.user.protected ? <i className="fa fa-lock lock-icon"></i> : ""}
            </span>
        );
    }
}

class RetweetedBy extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.status === undefined) {
            return <span className="retweeted-by"></span>;
        }

        return (
            <div className="retweeted-by">
                <i className="fa fa-retweet"></i> Retweeted by <ExternalLink url={"https://twitter.com/" + this.props.user.screen_name}>
                    <img className="retweeted-avatar" src={this.props.user.profile_image_url}/>
                </ExternalLink> <UserName user={this.props.user} name="retweet-author"/>
            </div>
        );
    }
}

class Footer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let children = [];
        let counter = 0;
        for (const item of this.props.children) {
            children.push(item);
            children.push(<div className="expander" key={counter++}/>);
        }

        return (
            <div className="footer">
                <div className="expander"/>
                {children}
            </div>
        );
    }
}

export default class Tweet extends React.Component {
    constructor(props) {
        super(props);
        this.state = feed_store.getItemState(this.props.item_id);
    }

    makeCreatedAtLabel(tw) {
        if (tw.created_at === undefined) {
            return "";
        }
        var d = new Date(tw.created_at);
        return `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)} ${d.getMonth()+1}/${d.getDate()} ${d.getYear() + 1900}`;
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

    // TODO:
    // 'extended_entities' may contains not only image but video and animated GIF.
    //
    //   https://dev.twitter.com/overview/api/entities-in-twitter-objects
    //
    renderMedia(status) {
        if (status.extended_entities !== undefined && status.extended_entities.media !== undefined) {
            return <ImagePreview media={status.extended_entities.media} item_id={this.props.item_id}/>;
        }

        if (status.entities.media !== undefined) {
            return <ImagePreview media={status.entities.media} item_id={this.props.item_id}/>;
        }

        return "";
    }

    render() {
        const tw = this.props.tweet.retweeted_status || this.props.tweet;

        return (
            <div className="tweet" data-focused={this.state.focused}>
                <div className="main" data-focused={this.state.focused}>
                    <div className="avatar">
                        <ExternalLink url={"https://twitter.com/" + tw.user.screen_name}>
                            <img src={tw.user.profile_image_url} />
                        </ExternalLink>
                    </div>
                    <div className="content">
                        <div className="secondary">
                            <ExternalLink url={"https://twitter.com/" + tw.user.screen_name}>
                                <UserName user={tw.user} name="author"/>
                            </ExternalLink>
                            <RetweetedBy user={this.props.tweet.user} status={this.props.tweet.retweeted_status}/>
                            <span className="created-at">
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
                <Footer>
                    <span className="icon"><i className="fa fa-reply"/></span>
                    <IconCounter icon="fa-star" color={tw.favorited ? "orange" : ""} count={tw.favorite_count} />
                    <IconCounter icon="fa-retweet" color={tw.favorited ? "forestgreen" : ""} count={tw.retweet_count} />
                    <span className="icon"><i className="fa fa-ellipsis-h"/></span>
                </Footer>
            </div>
        );
    }
}

