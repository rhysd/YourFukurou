import assign from "object-assign";
import * as FeedAction from "./feed-actions";

const DEFAULT_ACTION_MAP = {
    FocusNext: () => FeedAction.focusNext(),
    FocusPrev: () => FeedAction.focusPrev(),
    FocusFirst: () => FeedAction.focusFirst(),
    FocusLast: ()=> FeedAction.focusLast()
};

export default class KeymapHandler {
    constructor() {
        this.keymaps = {};
        this.action_map = {
            FocusNext: FeedAction.focusNext,
            FocusPrev: FeedAction.focusPrev,
            FocusFirst: FeedAction.focusFirst,
            FocusLast: FeedAction.focusLast
        };
    }

    registerKeyMap(key, action_name) {
        if (this.keymaps[key] !== undefined) {
            Mousetrap.unbind(key);
        }

        this.keymaps[key] = action_name;
        const action = this.action_map[action_name];
        if (action !== undefined) {
            Mousetrap.bind(key, action);
        }
    }

    registerKeyMaps(keymaps) {
        for (const key in keymaps) {
            this.registerKeyMap(key, keymaps[key]);
        }
    }

    registerAction(action_name, action) {
        this.action_map[action_name] = action;
        for (const key in this.keymaps) {
            if (this.keymaps[key] === action_name) {
                this.registerKeyMap(key, action_name);
            }
        }
    }

    registerActions(action_map) {
        for (const action_name in action_map) {
            this.registerAction(action_name, action_map[action_name]);
        }
    }
}
