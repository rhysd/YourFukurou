import {EventEmitter} from "events";
import Dispatcher from "./dispatcher";
import {ActionKind} from "./constants";

class MenuStore extends EventEmitter {
    constructor() {
        super();
        this.items = [];
    }

    getAll() {
        return this.items;
    }

    lookUpByName(name) {
        for (const i of this.items) {
            if (name === i.name) {
                return i;
            }
        }
        return null;
    }
}

let store = new MenuStore();
export default store;

store.dispatch_token = Dispatcher.register(action => {
    switch(action.type) {
    case ActionKind.AddMenuItem: {
        store.items.push({
            name: action.name,
            item: action.item,
            body: action.body
        });
        store.emit('item-added');
        break;
    }

    case ActionKind.ToggleMenu: {
        store.emit('toggle-requested');
        break;
    }

    default:
        break;
    }
});
