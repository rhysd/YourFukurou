import {EventEmitter} from "events";

export default new class FeedStore extends EventEmitter {
    constructor() {
        super();
        this.items = {};
    }

    register(key, item) {
        this.items[key] = item;
        this.emit('added', key);
    }

    update(key, item) {
        this.items[key] = item;
        this.emit('changed', key)
    }

    getAll() {
        return this.items;
    }

    getItem(key) {
        return this.items[key];
    }
}

