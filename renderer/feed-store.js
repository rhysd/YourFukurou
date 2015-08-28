import {EventEmitter} from "events";
import Dispatcher from "./dispatcher";
import {ActionKind} from "./constants";

class FeedStore extends EventEmitter {
    constructor() {
        super();
        this.focused_item_idx = null;
        this.ids = [];
        this.items = {};
        this.setMaxListeners(0);  // Do not limit number of listeners
    }

    getFocusedId() {
        return this.ids[this.focused_item_idx];
    }

    getAllIds() {
        return this.ids;
    }

    getAllItemState() {
        return this.items;
    }

    getItemState(id) {
        return this.items[id];
    }
}

// TODO
// Use constants for event name

let store = new FeedStore();
export default store;

function _updateItem(id, updated) {
    store.items[id] = updated;
    store.emit("item-changed", id, store.items[id]);
}

function _updateItemState(id, key, value) {
    store.items[id][key] = value;
    store.emit("item-changed", id, store.items[id]);
}

function _focusByIdx(idx) {
    const new_id = store.ids[idx];
    if (new_id === undefined) {
        return;
    }

    if (store.focused_item_idx !== null) {
        const prev_id = store.ids[store.focused_item_idx];
        if (new_id === prev_id) {
            return;
        }
        _updateItemState(prev_id, "focused", false);
    }

    store.focused_item_idx = idx;
    _updateItemState(new_id, "focused", true);
    store.emit("focus-changed", new_id);
}

function _focusFirst() {
    _focusByIdx(store.ids.length - 1);
}


store.dispatch_token = Dispatcher.register(action => {
    switch(action.type) {
        case ActionKind.AddItem: {
            let {id, val} = action;
            store.ids.push(id);
            store.items[id] = val;
            store.emit("item-added", id, store.items[id]);
            break;
        }

        case ActionKind.FocusTo:
            _focusByIdx(store.ids.indexOf(action.id));
            break;

        case ActionKind.FocusNext:
            if (store.focused_item_idx === null) {
                _focusFirst();
                break;
            }

            _focusByIdx(store.focused_item_idx - 1);
            break;

        case ActionKind.FocusPrev:
            if (store.focused_item_idx === null) {
                _focusFirst();
                return;
            }

            _focusByIdx(store.focused_item_idx + 1);
            break;

        case ActionKind.FocusFirst:
            _focusFirst();
            break;

        case ActionKind.FocusLast:
            _focusByIdx(0);
            break;

        case ActionKind.Blur: {
            if (store.focused_item_idx === null) {
                return;
            }
            const id = store.getFocusedId();
            _updateItemState(store.getFocusedId(), "focused", false);
            store.focused_item_idx = null;
            store.emit("focus-changed", id);
            break;
        }

        case ActionKind.UpdateItem: {
            let {id, updated} = action;
            _updateItem(id, updated);
            break;
        }

        case ActionKind.UpdateItemState: {
            let {id, key, value} = action;
            _updateItemState(id, key, value);
            break;
        }

        default:
            break;
    }
});
