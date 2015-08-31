import assign from "object-assign";
import * as FeedAction from "./feed-actions";
import feed_store from "./feed-store";

export default class KeymapHandler {
    constructor(global_keymaps) {
        this.keymaps = {};
        this.global_keymaps = global_keymaps;
        this.action_map = {
            FocusNext: FeedAction.focusNext,
            FocusPrev: FeedAction.focusPrev,
            FocusFirst: FeedAction.focusFirst,
            FocusLast: FeedAction.focusLast
        };

        for (const k in global_keymaps) {
            const action = this.action_map[global_keymaps[k]];
            if (action !== undefined) {
                Mousetrap.bind(k, action);
            }
        }
    }

    registerKeyMap(key, source, action_name) {
        if (this.keymaps[source] === undefined) {
            this.keymaps[source] = {};
        }

        if (this.keymaps[source][key] !== undefined) {
            Mousetrap.unbind(key);
        }

        this.keymaps[source][key] = action_name;

        if (this.global_keymaps[key] === undefined) {
            Mousetrap.bind(key, this.selectAction(key, action_name));
        }
    }

    registerKeyMaps(source, keymaps) {
        for (const key in keymaps) {
            this.registerKeyMap(key, source, keymaps[key]);
        }
    }

    registerAction(action_name, action) {
        this.action_map[action_name] = action;
    }

    registerActions(action_map) {
        for (const action_name in action_map) {
            this.registerAction(action_name, action_map[action_name]);
        }
    }

    selectAction(key, action_name) {
        return () => {
            console.log("key: " + key + ", action: " + action_name);

            // Broadcast key to sources
            const id = feed_store.getFocusedId();
            const item = feed_store.getItemState(id);
            if (!item || !item.source) {
                return;
            }

            const keymaps = this.keymaps[item.source];
            if (keymaps === undefined) {
                return;
            }

            console.log('keymaps: ', keymaps);

            const action_name2 = keymaps[key];
            if (action_name2 === undefined) {
                return;
            }
            console.log('action_name2: ', action_name2);

            const action = this.action_map[action_name2];
            if (action === undefined) {
                return;
            }

            // TODO: Choose action_name or action_name2

            console.log('action: ', action);
            action(id);
        };
    }
}
