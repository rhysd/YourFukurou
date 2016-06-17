global.require = require;
import {readFileSync, lstatSync} from 'fs';
import * as path from 'path';
import {Twitter} from 'twit';
import Tweet, {TwitterUser} from '../../../renderer/item/tweet';

export default class Fixture {
    private cache: {[name: string]: any};

    constructor() {
        this.cache = {};
    }

    getJsonFile(name: string) {
        let dir = __dirname;
        const root = path.parse(dir).root;
        while (dir !== root) {
            try {
                const p = path.join(dir, 'fixture', `${name}.json`);
                lstatSync(p);
                return p;
            } catch (e) {
                // Skip
            }
            dir = path.dirname(dir);
        }
        return null;
    }

    readJson<T>(name: string): T {
        const cache = this.cache[name];
        if (cache) {
            return cache as T;
        }
        const file = this.getJsonFile(name);
        const parsed = JSON.parse(readFileSync(file, 'utf8'));
        this.cache[name] = parsed;
        return parsed as T;
    }

    tweet() {
        return new Tweet(this.readJson<Twitter.Status>('tweet'));
    }

    retweet() {
        return new Tweet(this.readJson<Twitter.Status>('retweet_media'));
    }

    media() {
        return new Tweet(this.readJson<Twitter.Status>('retweet_media'));
    }

    quote() {
        return new Tweet(this.readJson<Twitter.Status>('retweet_media'));
    }

    quote_media() {
        return new Tweet(this.readJson<Twitter.Status>('quote_media'));
    }

    user() {
        return new TwitterUser(this.readJson<Twitter.User>('user'));
    }
}
