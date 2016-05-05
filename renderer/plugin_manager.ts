import TimelineState from './states/timeline';
import Tweet from './item/tweet';
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
        notification?: (tw: Tweet) => boolean;
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
        const plugin: Plugin = global.require(p);
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
                const rejected = !p.filter.home_timeline(tw, timeline);
                if (rejected) {
                    log.debug(`Plugin '${p._path}' rejects a tweet in home timeline: @${tw.user.screen_name}: ${tw.text}`);
                    return true;
                }
            }
        }
        return false;
    }

    shouldRejectTweetInMentionTimeline(tw: Tweet, timeline: TimelineState) {
        for (const p of this.plugins) {
            if (p.filter && p.filter.mention_timeline) {
                const rejected = !p.filter.mention_timeline(tw, timeline);
                if (rejected) {
                    log.debug(`Plugin '${p._path}' rejects a tweet in mention timeline: @${tw.user.screen_name}: ${tw.text}`);
                    return true;
                }
            }
        }
        return false;
    }

    shouldRejectNotification(tw: Tweet) {
        for (const p of this.plugins) {
            if (p.filter && p.filter.notification) {
                const rejected = !p.filter.notification(tw);
                if (rejected) {
                    return true;
                }
            }
        }
        return false;
    }
}

const PM = new PluginManager();
export default PM;
