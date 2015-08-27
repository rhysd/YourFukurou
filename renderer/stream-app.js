import MessageRouter from "./message-router.js";
import feed_item_store from "./feed-item-store";

const path = global.require("path");
const app = remote.require("app");

export let router = new MessageRouter();

export function getStore(name) {
    if (name === "feed-item") {
        return feed_item_store;
    }
    console.error("Ignored invalid store name: " + name);
}
