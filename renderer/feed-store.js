import {EventEmitter} from "events";
import feed_item_store from "./feed-item-store";

export default new class FeedStore extends EventEmitter {
    constructor() {
        super();
        this.focused_item_idx = null;
        this.ids = [];
    }

    // TODO
    // Use constants for event name

    // TODO:
    // Use Dispatcher
    // Actions {{{

    createItem(id, item) {
        this.ids.push(id);
        feed_item_store.register(id, item);
    }

    _focusByIdx(idx) {
        const new_id = this.ids[idx];
        if (new_id === undefined) {
            return;
        }

        if (this.focused_item_idx !== null) {
            const prev_id = this.ids[this.focused_item_idx];
            if (new_id === prev_id) {
                return;
            }
            feed_item_store.update(prev_id, "focused", false);
        }

        this.focused_item_idx = idx;
        feed_item_store.update(new_id, "focused", true);
        this.emit("focus-changed");
    }

    focusTo(new_id) {
        const new_idx = this.ids.indexOf(new_id);
        if (new_idx === -1) {
            return;
        }
        this._focusByIdx(new_idx);
    }

    focusNext() {
        if (this.focused_item_idx === null) {
            this.focusFirst();
            return;
        }

        if (this.focused_item_idx === 0) {
            return;
        }

        this.focusTo(this.focused_item_idx - 1);
    }

    focusPrev() {
        // Note: If no item is focused, focus head
        if (this.focused_item_idx === null) {
            this.focusFirst();
            return;
        }

        if (this.focused_item_idx === this.ids.length - 1) {
            return;
        }

        this.focusTo(this.focused_item_idx + 1);
    }

    focusHead() {
        this._focusByIdx(this.ids.length - 1);
    }

    focusLast() {
        this._focusByIdx(0);
    }
    // }}}
}
