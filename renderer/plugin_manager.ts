import TimelineState from './states/timeline';
import Tweet, {TwitterUser} from './item/tweet';
import * as path from 'path';
import AppConfig from './config';
import log from './log';

export interface Plugin {
    // Note:
    // Filter function takes an item and returns boolean value:
    //   `true` if the item should *remain*
    //   `false` if the item should NOT *remain*
    filter?: {
        home_timeline?: (tw: Tweet, timeline: TimelineState) => boolean;
        mention_timeline?: (tw: Tweet, timeline: TimelineState) => boolean;
        tweet_notification?: (tw: Tweet) => boolean;
        like_notification?: (tw: Tweet, by_user: TwitterUser) => boolean;
    };

    // Note:
    // Below properties are automatically added by PluginManager.
    // Plugin providers MUST NOT add them.
    _path?: string;
}

class PluginManager {
    public loaded: boolean;

    constructor(public plugins: Plugin[] = []) {
        this.loaded = false;
    }

    validatePlugin(p: Plugin) {
        let valid = true;
        for (const prop in p) {
            if (prop !== 'filter' &&
                prop !== '_path') {
                log.error(`Plugin ${p._path}: Invalid property '${prop}'`);
                valid = false;
            }
        }
        return valid;
    }

    loadPluginFromPath(p: string) {
        const mod = global.require(p) as {plugin?: Plugin};
        if (!mod.plugin) {
            log.error('Invalid plugin:', p, ' plugin must be exported to `exports.plugin`');
            return;
        }
        const plugin = mod.plugin;
        plugin._path = p;
        if (this.validatePlugin(plugin)) {
            this.plugins.push(plugin);
            log.debug('Plugin was added:', p);
        }
    }

    loadPlugins() {
        const app = global.require('electron').remote.app;
        const plugin_paths = AppConfig.remote_config.plugin;

        for (let p of plugin_paths) {
            if (!path.isAbsolute(p)) {
                p = path.join(app.getPath('userData'), p);
            }
            this.loadPluginFromPath(p);
        }

        this.loaded = true;
    }

    shouldRejectTweetInHomeTimeline(tw: Tweet, timeline: TimelineState) {
        for (const p of this.plugins) {
            if (p.filter && p.filter.home_timeline) {
                try {
                    const rejected = !p.filter.home_timeline(tw, timeline);
                    if (rejected) {
                        log.debug(`Plugin '${p._path}' rejects a tweet in home timeline: @${tw.user.screen_name}: ${tw.text}`);
                        return true;
                    }
                } catch (e) {
                    log.debug(`Plugin '${p._path}' threw an exception at filtering home timeline:`, e, tw);
                }
            }
        }
        return false;
    }

    shouldRejectTweetInMentionTimeline(tw: Tweet, timeline: TimelineState) {
        for (const p of this.plugins) {
            if (p.filter && p.filter.mention_timeline) {
                try {
                    const rejected = !p.filter.mention_timeline(tw, timeline);
                    if (rejected) {
                        log.debug(`Plugin '${p._path}' rejects a tweet in mention timeline: @${tw.user.screen_name}: ${tw.text}`);
                        return true;
                    }
                } catch (e) {
                    log.debug(`Plugin '${p._path}' threw an exception at filtering mention timeline:`, e, tw);
                }
            }
        }
        return false;
    }

    shouldRejectTweetNotification(tw: Tweet) {
        for (const p of this.plugins) {
            if (p.filter && p.filter.tweet_notification) {
                try {
                    const rejected = !p.filter.tweet_notification(tw);
                    if (rejected) {
                        return true;
                    }
                } catch (e) {
                    log.debug(`Plugin '${p._path}' threw an exception at filtering notification:`, e, tw);
                }
            }
        }
        return false;
    }

    shouldRejectLikeNotification(tw: Tweet, by: TwitterUser) {
        for (const p of this.plugins) {
            if (p.filter && p.filter.like_notification) {
                try {
                    const rejected = !p.filter.like_notification(tw, by);
                    if (rejected) {
                        return true;
                    }
                } catch (e) {
                    log.debug(`Plugin '${p._path}' threw an exception at filtering notification:`, e, tw);
                }
            }
        }
        return false;
    }
}

const PM = new PluginManager();
export default PM;
