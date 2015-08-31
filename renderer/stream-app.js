import MessageRouter from "./message-router.js";
import feed_store from "./feed-store";
import Dispatcher from "./dispatcher";

const path = global.require("path");
const app = remote.require("app");

export let router = new MessageRouter();
export let dispatcher = Dispatcher;

export function getStore(name) {
    if (name === "feed") {
        return feed_store;
    }
    console.error("Ignored invalid store name: " + name);
    return null;
}
