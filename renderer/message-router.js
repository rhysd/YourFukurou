const ipc = global.require("ipc");

export default class MessageRouter {
    constructor() {
        this.sinks = [];
        this.renderers = {};
    }

    registerSink(sink) {
        // TODO: Validate sink
        this.sinks.push(sink);
    }

    registerRenderer(source_name, stream_name, renderer) {
        if (!(source_name in this.renderers)) {
            this.renderers[source_name] = {};
        }
        // TODO: Multiple renderers should be registered for the same stream
        this.renderers[source_name][stream_name] = renderer;
    }

    getSinks(source_name) {
        return this.sinks.filter(sink => sink.source === source_name);
    }

    invokeRenderer(receiver, stream_name, stream_renderers, data) {
        if (!(stream_name in stream_renderers)) {
            console.log(`MessageRouter: Message to ${stream_name} is ignored because Renderer doesn't exist`);
            return;
        }
        console.log('MessageRouter: Route data to stream: ' + stream_name);
        stream_renderers[stream_name](receiver(data));
    }

    routeMessageToSink(sink, stream_name, data, stream_renderers) {
        if (stream_name === "*") {
            for (const key in sink.streams) {
                this.invokeRenderer(sink.streams[key], key, stream_renderers, data);
            }
        } else {
            if (!(stream_name in sink.streams)) {
                console.log(`Dropped message: Source '${sink.source}' doesn't have stream named '${stream_name}'`);
                return;
            }
            this.invokeRenderer(sink.streams[stream_name], stream_name, stream_renderers, data);
        }
    }

    routeMessage(source_name, stream_name, data) {
        if (!(source_name in this.renderers)) {
            console.log(`MessageRouter: Message ${source_name}-${stream_name} is ignored because Renderer for source '${source_name}' doesn't exist`);
            return;
        }

        let stream_renderers = this.renderers[source_name];

        for (const sink of this.sinks) {
            if (source_name === sink.source) {
                this.routeMessageToSink(sink, stream_name, data, stream_renderers);
            }
        }
    }

    start() {
        ipc.on("stream-message", (channel, data) => {
            const sep_idx = channel.indexOf("-");
            if (sep_idx === -1) {
                console.log("Invalid channel: " + channel);
                return;
            }

            this.routeMessage(channel.slice(0, sep_idx), channel.slice(sep_idx + 1), data);
        });
        ipc.send("renderer-ready", this.sinks.map(sink => sink.source));
    }
}

