import * as Twitter from "twitter";
import * as fs from "fs";
import * as path from "path";
import * as app from "app";
import authenticate from "./authenticate";

class TwitterSource {
    client: Twitter.TwitterClient;

    constructor(public send: (stream: string, data: any) => void) {
        const consumer_key = "nlJrrGNz9N5Vc0CwHIwESaEti";
        const consumer_secret = "xwyFlPHNYgUh2ZyVDzvMXCHbna6QzejpPjadalONvPMfehapw2";
        const tokens_file = path.join(app.getPath("userData"), "tokens.json");

        new Promise(resolve => {
            try {
                resolve(fs.readFileSync(tokens_file, {encoding: "utf8"}));
            } catch (e) {
                resolve(authenticate(consumer_key, consumer_secret));
            }
        }).then((tokens: any) => {
            fs.writeFile(tokens_file, JSON.stringify(tokens), {encoding: "utf8"});

            this.client = new Twitter({
                consumer_key:        consumer_key,
                consumer_secret:     consumer_secret,
                access_token_key:    tokens.access_token,
                access_token_secret: tokens.access_token_secret,
            });

            this.start_sending();
        }).catch((error: Error) => {
            console.log("OAuth authentication failed.");
            console.log(error.message);

            const access_token = process.env.TWITTER_ACCESS_TOKEN;
            const access_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

            if (access_token && access_secret) {
                this.client = new Twitter({
                    consumer_key:        consumer_key,
                    consumer_secret:     consumer_secret,
                    access_token_key:    access_token,
                    access_token_secret: access_secret,
                });
                this.start_sending();
            } else {
                console.log("Gave up authentication...");
            }
        });
    }

    start_sending() {
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
