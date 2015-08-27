import {EventEmitter} from "events";

export default new class FeedItemStore extends EventEmitter {
    constructor() {
        super();
        this.items = {};
        this.setMaxListeners(0);  // Do not limit number of listeners
    }

    // TODO:
    // Use Dispatcher

    register(id, item) {
        this.items[id] = item;
        this.emit("added", id, this.items[id]);
    }

    updateItem(id, item) {
        this.items[id] = item;
        this.emit("changed", id, this.items[id]);
    }

    update(id, key, value) {
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

