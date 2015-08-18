import * as Twitter from "twitter";

class TwitterSource {
    client: Twitter.TwitterClient;

    constructor(public send: (stream: string, data: any) => void) {
    }

    initialize() {
        this.client = new Twitter({
            consumer_key: "",
            consumer_secret: "",
            access_token_key: "",
            access_token_secret: "",
        });

        this.start_streaming({});
    }

    start_streaming(params: Object) {
        this.client.stream("user", params, (stream: Twitter.TwitterStream) => {
            stream.on("data", (json: Object) => {
                if (json === undefined) {
                    return;
                }

                if (!("text" in json)) {
                    return;
                }

                this.send("tweet", json);
            });

            stream.on("error", (error: Error) => {
                console.log("plugin-twitter: Error on stream: " + error.toString());
            });

            stream.on("end", (response: Object) => {
                console.log("plugin-twitter: End message on stream: " + response);

                // Note: Reconnect
                this.start_streaming(params);
            })
        });
    }
}
export = TwitterSource;
