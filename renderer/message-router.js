export default class MessageRouter {
    constructor() {
        this.sinks = [];
        this.renderers = {};
    }

    addSink(sink) {
        this.sinks.push(sink);
    }

    registerRenderer(source_name, stream_name, renderer) {
        if (!(source_name in this.renderers)) {
            this.renderers[source_name] = {};
        }
        // TODO: Multiple renderers should be registered for the same stream
        this.renderers[source_name][stream_name] = renderer;
    }

    invokeRenderer(receiver, stream_name, stream_renderers, data) {
        if (!(stream_name in stream_renderers)) {
            console.log(`MessageRouter: Message to ${stream_name} is ignored because Renderer doesn't exist`);
            return;
        }
        console.log('MessageRouter: Data received: ' + data);
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
}
