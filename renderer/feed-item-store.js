import {EventEmitter} from "events";
import Dispatcher from "./dispatcher";
import {ActionKind} from "./constants";

class FeedItemStore extends EventEmitter {
    constructor() {
        super();
        this.items = {};
        this.setMaxListeners(0);  // Do not limit number of listeners
    }

    updateWholeItem(id, updated) {
        this.items[id] = updated;
        this.emit("changed", id, this.items[id]);
    }

    updateItem(id, key, value) {
        this.items[id][key] = value;
        this.emit("changed", id, this.items[id]);
    }

    getAll() {
        return this.items;
    }

    getItem(id) {
        return this.items[id];
    }
}

let store = new FeedItemStore();
export default store;

store.dispatch_token = Dispatcher.register(action => {
    switch(action.type) {
        case ActionKind.AddItem: {
            let {id, val} = action;
            store.items[id] = val;
            store.emit("added", id, store.items[id]);
            break;
        }
        case ActionKind.UpdateWholeItem: {
            let {id, updated} = action;
            store.updateWholeItem(id, updated);
            break;
        }
        case ActionKind.UpdateItem: {
            let {id, key, value} = action;
            store.updateItem(id, key, value);
            break;
        }
        default:
            break;
    }
});
