import MessageRouter from "./message-router.js";

const path = global.require("path");
const app = remote.require("app");

export let router = new MessageRouter();

export function requireStore(name) {
    console.error('requireStore() is not implemented yet: ' + name);
}
