import assign from "object-assign";
import * as FeedAction from "./feed-actions";
import feed_store from "./feed-store";
import * as MenuAction from "./menu-actions";

export default class KeymapHandler {
    constructor(global_keymaps) {
        this.keymaps = {};
        this.action_map = {};

        this.global_keymaps = global_keymaps;
        this.global_action_map = {
            FocusNext: FeedAction.focusNext,
            FocusPrev: FeedAction.focusPrev,
            FocusFirst: FeedAction.focusFirst,
            FocusLast: FeedAction.focusLast,
            ToggleDevTools: () => remote.getCurrentWindow().toggleDevTools(),
            ToggleMenu: MenuAction.toggleMenu
        };

        for (const k in global_keymaps) {
            const action = this.global_action_map[global_keymaps[k]];
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
            Mousetrap.bind(key, this.selectAction(source, action_name));
        }
    }

    registerKeyMaps(source, keymaps) {
        for (const key in keymaps) {
            this.registerKeyMap(key, source, keymaps[key]);
        }
    }

    registerAction(source, action_name, action) {
        if (this.action_map[source] === undefined) {
            this.action_map[source] = {};
        }
        this.action_map[source][action_name] = action;
    }

    registerActions(source, action_map) {
        for (const action_name in action_map) {
            this.registerAction(source, action_name, action_map[action_name]);
        }
    }

    selectAction(source, action_name) {
        // Broadcast key to sources
        return () => {
            const id = feed_store.getFocusedId();
            const item = feed_store.getItemState(id);
            if (!item || !item.source || item.source !== source) {
                return;
            }

            const action = this.action_map[source][action_name];
            if (action === undefined) {
                return;
            }

            action(id);
        };
    }
}
