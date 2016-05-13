import Item from './item';
import TweetTextParser, {TweetTextToken} from '../tweet_parser';
import {Twitter} from 'twit';

const shell = global.require('electron').shell;

const re_normal_size = /normal(?=\.\w+$)/i;

function truncateCount(count: number) {
    'use strict';
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

    get icon_url() {
        const url = this.json.profile_image_url;
        if (window.devicePixelRatio < 1.5) {
            return url;
        } else {
            return url.replace(re_normal_size, 'bigger');
        }
    }

    get big_icon_url() {
        return this.json.profile_image_url.replace(re_normal_size, 'bigger');
    }

    get mini_icon_url() {
        return this.json.profile_image_url;
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

    get user_site_url() {
        if (this.json.entities && this.json.entities.url &&
            this.json.entities.url.urls.length > 0) {
            return this.json.entities.url.urls[0];
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
    private retweeted_status_memo: Tweet;
    private quoted_status_memo: Tweet;
    private parsed_tokens_memo: TweetTextToken[];
    private created_at_memo: Date;

    constructor(public json: Twitter.Status) {
        this.user = new TwitterUser(json.user);
        this.retweeted_status_memo = null;
        this.quoted_status_memo = null;
        this.parsed_tokens_memo = null;
        this.created_at_memo = null;
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
        return this.created_at_memo;
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
        if (!this.json.entities || !this.json.entities.urls) {
            return [];
        }
        return this.json.entities.urls;
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
        return `https://twitter.com/hadakadenkyu/status/${this.getMainStatus().json.id_str}`;
    }

    openStatusPageInBrowser() {
        shell.openExternal(this.statusPageUrl());
    }

    clone() {
        return new Tweet(this.json);
    }
}

