import {EventEmitter} from "events";
import Dispatcher from "./dispatcher";
import {ActionKind} from "./constants";
import feed_item_store from "./feed-item-store";

class FeedStore extends EventEmitter {
    constructor() {
        super();
        this.focused_item_idx = null;
        this.ids = [];
    }

    getAllIds() {
        return this.ids;
    }
}

// TODO
// Use constants for event name

let store = new FeedStore();
export default store;


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
        feed_item_store.updateItem(prev_id, "focused", false);
    }

    store.focused_item_idx = idx;
    feed_item_store.updateItem(new_id, "focused", true);
    store.emit("focus-changed");
}

function _focusFirst() {
    store._focusByIdx(store.ids.length - 1);
}


store.dispatch_token = Dispatcher.register(action => {
    switch(action.type) {
        case ActionKind.AddItem:
            store.ids.push(action.id);
            break;
        case ActionKind.FocusTo:
            _focusByIdx(store.ids.indexOf(action.id));
            break;
        case ActionKind.FocusNext:
            if (store.focused_item_idx === null) {
                _focusFirst();
                return;
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
        default:
            break;
    }
});
