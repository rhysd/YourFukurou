import {autoLinkEntities, EntityWithIndices} from 'twitter-text';
import Item from './item';
import TweetTextParser, {TweetTextToken} from '../tweet_parser';

const re_normal_size = /normal(?=\.\w+$)/i;

export class TwitterUser {
    constructor(public json: UserJson) {}

    get icon_url() {
        const url = this.json.profile_image_url_https;
        if ((window.devicePixelRatio || 1) < 1.5) {
            return url;
        } else {
            return url.replace(re_normal_size, 'bigger');
        }
    }

    get screen_name() {
        return this.json.screen_name;
    }

    get protected() {
        return this.json.protected;
    }

    get name() {
        return this.json.name;
    }

    get id() {
        return this.json.id;
    }

    userPageUrl() {
        return `https://twitter.com/${this.json.screen_name}`;
    }
}

export default class Tweet implements Item {
    public user: TwitterUser;
    private retweeted_status_memo: Tweet;
    private quoted_status_memo: Tweet;
    private parsed_tokens_memo: TweetTextToken[];

    constructor(public json: TweetJson) {
        this.user = new TwitterUser(json.user);
        this.retweeted_status_memo = null;
        this.quoted_status_memo = null;
        this.parsed_tokens_memo = null;
    }

    get id() {
        return this.json.id_str;
    }

    get created_at() {
        return new Date(this.json.created_at);
    }

    get retweeted() {
        return this.json.retweeted;
    }

    get favorited() {
        return this.json.favorited;
    }

    get retweeted_status() {
        if (!this.json.retweeted_status) {
            return null;
        }
        if (this.retweeted_status_memo === null) {
            this.retweeted_status_memo = new Tweet(this.json.retweeted_status);
        }
        return this.retweeted_status_memo;
    }

    get retweet_count() {
        if (this.json.retweeted_status) {
            return this.json.retweeted_status.retweet_count;
        } else {
            return this.json.retweet_count;
        }
    }

    get favorite_count() {
        if (this.json.retweeted_status) {
            return this.json.retweeted_status.favorite_count;
        } else {
            return this.json.favorite_count;
        }
    }

    get quoted_status() {
        if (!this.json.quoted_status) {
            return null;
        }
        if (this.quoted_status_memo === null) {
            this.quoted_status_memo = new Tweet(this.json.quoted_status);
        }
        return this.quoted_status_memo;
    }

    get parsed_tokens() {
        if (this.parsed_tokens_memo === null) {
            const parser = new TweetTextParser(this.json);
            this.parsed_tokens_memo = parser.parse();
        }
        return this.parsed_tokens_memo;
    }

    getMainStatus() {
        if (this.json.retweeted_status) {
            return this.retweeted_status;
        } else {
            return this;
        }
    }

    isRetweet() {
        return !!this.json.retweeted_status;
    }

    getRetweetedUser() {
        if (!this.json.retweeted_status) {
            return null;
        }
        return this.user;
    }

    hasQuote() {
        return !!this.json.quoted_status;
    }

    hasInReplyTo() {
        return !!this.json.in_reply_to_status_id_str;
    }

    mentionsTo(user: TwitterUser) {
        const my_id = user.id;
        if (this.json.in_reply_to_user_id === my_id) {
            return true;
        }

        if (this.json.retweeted_status && this.json.retweeted_status.user.id === my_id) {
            return true;
        }

        if (this.json.quoted_status && this.json.quoted_status.user.id === my_id) {
            return true;
        }

        if (this.json.entities && this.json.entities.user_mentions) {
            for (const m of this.json.entities.user_mentions) {
                if (m.id === my_id) {
                    return true;
                }
            }
        }

        return false;
    }

    getAllEntities() {
        if (!this.json.entities) {
            return [];
        }
        let es = this.json.entities;
        let ret = [] as EntityWithIndices[];
        const push = Array.prototype.push;
        if (es.urls) {
            push.apply(ret, es.urls);
        }
        if (es.hashtags) {
            push.apply(ret, es.hashtags);
        }
        if (es.user_mentions) {
            for (const m of es.user_mentions) {
                (m as any).screenName = m.screen_name;
            }
            push.apply(ret, es.user_mentions);
        }
        return ret;
    }

    buildLinkedHTML() {
        return autoLinkEntities(this.json.text, this.getAllEntities(), {
            urlEntities: this.json.entities.urls,
        });
    }

    getCreatedAtString() {
        const created_at = this.json.created_at;
        if (created_at === undefined) {
            return '';
        }
        const date = new Date(created_at);
        const hh = date.getHours();
        const mm = date.getMinutes();
        const m = date.getMonth();
        const d = date.getDate();
        const yyyy = date.getFullYear();
        return `${('0' + hh).slice(-2)}:${('0' + mm).slice(-2)} ${m + 1}/${d} ${yyyy}`;
    }

    statusPageUrl() {
        return `https://twitter.com/hadakadenkyu/status/${this.getMainStatus().json.id_str}`;
    }

    clone() {
        return new Tweet(this.json);
    }
}

