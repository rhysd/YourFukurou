import MessageRouter from './message-router.js';

const ipc = global.require("ipc");

export default class StreamAppClass {
    constructor() {
        this.router = new MessageRouter();
    }

    registerSink(sink) {
        // TODO: Validate sink
        this.router.addSink(sink);
    }

    startReceiving() {
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

