import MessageRouter from "./message-router.js";
import React from "react";

const ipc = global.require("ipc");
const path = global.require("path");
const app = remote.require("app");

class StreamDispatcher {
    constructor() {
        this.router = new MessageRouter();
    }

    registerSink(sink) {
        // TODO: Validate sink
        this.router.addSink(sink);
    }

    start() {
        ipc.on("stream-message", (channel, data) => {
            const sep_idx = channel.indexOf("-");
            if (sep_idx === -1) {
                console.log("Invalid channel: " + channel);
                return;
            }

            this.router.routeMessage(channel.slice(0, sep_idx), channel.slice(sep_idx + 1), data);
        });
        ipc.send("renderer-ready", this.router.sinks.map(sink => sink.source));
    }

    getSinks(source_name) {
        return this.router.sinks.filter(sink => sink.source === source_name);
    }
}

export let dispatcher = new StreamDispatcher();

export function require_relative(mod) {
    const absolute_path = path.join(app.getAppPath(), "build", "renderer", mod);
    return global.require(absolute_path);
}
