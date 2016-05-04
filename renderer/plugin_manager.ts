import TimelineState from './states/timeline';
import Tweet from './item/tweet';
import * as path from 'path';
import log from './log';

export interface Plugin {
    // Note:
    // Filter function takes an item and returns boolean value:
    //   `true` if the item should *remain*
    //   `false` if the item should NOT *remain*
    filter?: {
        timeline?: (tw: Tweet, timeline: TimelineState) => boolean;
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

    // TODO:
    // validatePlugin()

    loadPluginFromPath(p: string) {
        const plugin: Plugin = global.require(p);
        plugin._path = p;
        this.plugins.push(plugin);
        log.debug('Plugin was added:', p);
    }

    loadPlugins() {
        const remote = global.require('electron').remote;
        const plugin_paths = (
            remote.getGlobal('config') as Config
        ).plugin;

        for (let p of plugin_paths) {
            if (!path.isAbsolute(p)) {
                p = path.join(remote.app.getPath('userData'), p)
            }
            this.loadPluginFromPath(p);
        }

        this.loaded = true;
    }

    shouldRejectTweet(tw: Tweet, timeline: TimelineState) {
        for (const p of this.plugins) {
            if (p.filter && p.filter.timeline) {
                const rejected = !p.filter.timeline(tw, timeline);
                if (rejected) {
                    log.debug(`Tweet was rejected by plugin '${p._path}' : @${tw.user.screen_name}: ${tw.text}`)
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
