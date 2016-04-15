import {autoLinkEntities, EntityWithIndices} from 'twitter-text';
import Item from './item';

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
}

export default class Tweet implements Item {
    public user: TwitterUser;

    constructor(public json: TweetJson) {
        this.user = new TwitterUser(json.user);
    }

    get id() {
        return this.json.id;
    }

    get created_at() {
        return new Date(this.json.created_at);
    }

    getMainStatus() {
        if (this.json.retweeted_status) {
            return new Tweet(this.json.retweeted_status);
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
}

