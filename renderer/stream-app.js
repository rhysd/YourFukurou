import MessageRouter from "./message-router.js";
import feed_store from "./feed-store";

const path = global.require("path");
const app = remote.require("app");

export let router = new MessageRouter();

export function getStore(name) {
    if (name === "feed") {
        return feed_store;
    }
    console.error("Ignored invalid store name: " + name);
}
