import * as Twitter from "twitter";
import * as fs from "fs";
import * as path from "path";

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

        const test_file = path.join(__dirname, "tweets.json");
        if (fs.existsSync(test_file)) {
            console.log("Load from tweets.json");
            fs.readFile(test_file, {encoding: "utf8"}, (err, data) => {
                if (err) {
                    return;
                }

                let tws = JSON.parse(data);
                let send = this.send;
                let count = 0;
                let send_delayed = () => {
                    if (count >= 5 || tws.length === 0) {
                        return;
                    }
                    send("tweet", tws.shift(1));
                    ++count;
                    setTimeout(send_delayed, 1000);
                };

                send_delayed();
            });
        } else {
            this.client.get("statuses/home_timeline", {}, (err, tweets, response) => {
                if (err) {
                    console.error("Plugin twitter: Fetch error: " + err);
                    return;
                }

                this.send("tweets", tweets);
            });
        }

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
