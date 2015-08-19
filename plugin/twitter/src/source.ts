import * as Twitter from "twitter";

class TwitterSource {
    client: Twitter.TwitterClient;

    constructor(public send: (stream: string, data: any) => void) {
    }

    initialize() {
        this.client = new Twitter({
            consumer_key:        process.env.TWITTER_CONSUMER_KEY,
            consumer_secret:     process.env.TWITTER_CONSUMER_SECRET,
            access_token_key:    process.env.TWITTER_ACCESS_TOKEN,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
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
                console.log("plugin-twitter: End message on stream: ", response);

                // Note: Reconnect
                this.start_streaming(params);
            });
        });
    }
}
export = TwitterSource;
