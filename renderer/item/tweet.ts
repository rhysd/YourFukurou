import Item from './item';
import TweetTextParser, {TweetTextToken} from '../tweet_parser';
import {Twitter} from 'twit';

const shell = global.require('electron').shell;

const re_normal_size = /normal(?=\.\w+$)/i;
const re_size_part = /_normal(?=\.\w+$)/i;

function truncateCount(count: number) {
    if (count >= 1000000) {
        return (Math.floor(count / 100000) / 10) + 'M';
    } else if (count >= 1000) {
        return (Math.floor(count / 100) / 10) + 'K';
    } else if (count === 0) {
        return '';
    } else {
        return count.toString();
    }
}

export class TwitterUser {
    constructor(public json: Twitter.User) {}

    get original_icon_url() {
        return this.json.profile_image_url.replace(re_size_part, '');
    }

    get icon_url() {
        const url = this.json.profile_image_url;
        if (window.devicePixelRatio < 1.5) {
            return url;
        } else {
            return url.replace(re_normal_size, 'bigger');
        }
    }

    get mini_icon_url() {
        if (window.devicePixelRatio < 1.5) {
            return this.icon_url_24x24;
        } else {
            return this.icon_url_48x48;
        }
    }

    get icon_url_73x73() {
        return this.json.profile_image_url.replace(re_normal_size, 'bigger');
    }

    get icon_url_48x48() {
        return this.json.profile_image_url;
    }

    get icon_url_24x24() {
        return this.json.profile_image_url.replace(re_normal_size, 'mini');
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

    get max_size_banner_url() {
        if (!this.json.profile_banner_url) {
            return null;
        }
        // Note: Currently 1500x500 is biggest banner image.
        return this.json.profile_banner_url + '/1500x500';
    }

    get big_banner_url() {
        return this.getBannerUrl('web');
    }

    get mini_banner_url() {
        return this.getBannerUrl('mobile');
    }

    get bg_color() {
        return this.json.profile_background_color;
    }

    get description() {
        return this.json.description;
    }

    get statuses_count() {
        return truncateCount(this.json.statuses_count);
    }

    get likes_count() {
        return truncateCount(this.json.favourites_count);
    }

    get followings_count() {
        return this.json.friends_count;
    }

    get followers_count() {
        return this.json.followers_count;
    }

    get link_color() {
        return this.json.profile_link_color;
    }

    get user_site_url(): Twitter.UrlEntity | null {
        if (this.json.entities &&
            this.json.entities.url &&
            this.json.entities.url.urls!.length > 0) {
            return this.json.entities.url.urls![0];
        } else if (this.json.url) {
            // Note: fallback
            return {
                display_url: this.json.url,
                expanded_url: this.json.url,
                indices: null,
                url: this.json.url,
            };
        } else {
            return null;
        }
    }

    get location() {
        return this.json.location;
    }

    followingPageUrl() {
        return `https://twitter.com/${this.json.screen_name}/following`;
    }

    followerPageUrl() {
        return `https://twitter.com/${this.json.screen_name}/followers`;
    }

    likePageUrl() {
        return `https://twitter.com/${this.json.screen_name}/likes`;
    }

    userPageUrl() {
        return `https://twitter.com/${this.json.screen_name}`;
    }

    openUserPageInBrowser() {
        shell.openExternal(this.userPageUrl());
    }

    openWebsiteInBrowser() {
        const url = this.user_site_url;
        if (url === null) {
            return;
        }
        shell.openExternal(url.expanded_url);
    }

    private getBannerUrl(label: string) {
        if (!this.json.profile_banner_url) {
            return null;
        }
        const size = window.devicePixelRatio < 1.5 ?  `/${label}` : `/${label}_retina`;
        return this.json.profile_banner_url + size;
    }
}

export default class Tweet implements Item {
    public user: TwitterUser;
    public related_statuses: Tweet[];
    public in_reply_to_status: Tweet | null;
    private retweeted_status_memo: Tweet | null;
    private quoted_status_memo: Tweet | null;
    private parsed_tokens_memo: TweetTextToken[] | null;
    private created_at_memo: Date | null;

    constructor(public json: Twitter.Status) {
        this.user = new TwitterUser(json.user);
        this.retweeted_status_memo = null;
        this.quoted_status_memo = null;
        this.parsed_tokens_memo = null;
        this.created_at_memo = null;
        this.related_statuses = [];
        this.in_reply_to_status = null;
    }

    get id() {
        return this.json.id_str;
    }

    get created_at() {
        if (this.created_at_memo === null) {
            const created_at = this.json.created_at;
            if (created_at !== undefined) {
                this.created_at_memo = new Date(created_at);
            }
        }
        return this.created_at_memo!;
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
            this.json.text = parser.text;
        }
        return this.parsed_tokens_memo;
    }

    get in_reply_to_status_id() {
        return this.json.in_reply_to_status_id_str;
    }

    get in_reply_to_user_id() {
        return this.json.in_reply_to_user_id;
    }

    get text() {
        return this.json.text;
    }

    get urls() {
        const json = this.getMainJson();
        if (!json.entities || !json.entities.urls) {
            return [];
        }
        return json.entities.urls;
    }

    get media() {
        if (!this.json.extended_entities) {
            return [];
        }
        if (!this.json.extended_entities.media) {
            return [];
        }
        return this.json.extended_entities.media;
    }

    get mentions() {
        if (!this.json.entities || !this.json.entities.user_mentions) {
            return [];
        }
        return this.json.entities.user_mentions;
    }

    get hashtags() {
        if (!this.json.entities || !this.json.entities.hashtags) {
            return [];
        }
        return this.json.entities.hashtags;
    }

    getMainStatus() {
        if (this.json.retweeted_status) {
            return this.retweeted_status!;
        } else {
            return this;
        }
    }

    getMainJson(): Twitter.Status {
        return this.json.retweeted_status || this.json;
    }

    isRetweet() {
        return !!this.json.retweeted_status;
    }

    isQuotedTweet() {
        return !!this.json.quoted_status;
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

    getCreatedAtString() {
        const date = this.created_at;
        const hh = date.getHours();
        const mm = date.getMinutes();
        const m = date.getMonth();
        const d = date.getDate();
        const yyyy = date.getFullYear();
        return `${('0' + hh).slice(-2)}:${('0' + mm).slice(-2)} ${m + 1}/${d} ${yyyy}`;
    }

    statusPageUrl() {
        return `https://twitter.com/${this.json.user.screen_name}/status/${this.getMainStatus().json.id_str}`;
    }

    openStatusPageInBrowser() {
        shell.openExternal(this.statusPageUrl());
    }

    openAllLinksInBrowser() {
        for (const u of this.urls.map(u => u.expanded_url)) {
            shell.openExternal(u);
        }
    }

    getChainedRelatedStatuses() {
        const push = Array.prototype.push;
        let ret = [] as Tweet[];
        for (const s of this.related_statuses) {
            push.apply(ret, s.getChainedRelatedStatuses());
        }
        push.apply(ret, this.related_statuses);
        return ret.sort((l, r) => -l.compareId(r));
    }

    // -1: lhs.id < rhs.id
    //  0: lhs.id == rhs.id
    //  1: lhs.id > rhs.id
    compareId(rhs: Tweet) {
        const s = Math.floor(this.json.id_str.length / 2);
        const lh = parseInt(this.json.id_str.slice(0, s), 10);
        const rh = parseInt(rhs.json.id_str.slice(0, s), 10);

        let v = lh - rh;
        if (v === 0) {
            const ll = parseInt(this.json.id_str.slice(s), 10);
            const rl = parseInt(rhs.json.id_str.slice(s), 10);
            v = ll - rl;
        }

        return v < 0 ? -1 : v > 0 ? 1 : 0;
    }

    clone() {
        const cloned = new Tweet(this.json);
        cloned.related_statuses = this.related_statuses;
        cloned.in_reply_to_status = this.in_reply_to_status;
        return cloned;
    }
}

