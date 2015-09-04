import * as BrowserWindow from "browser-window";
import * as Authenticator from "node-twitter-api";

export default function authenticate(consumer_key: string, consumer_secret: string) {
    return new Promise((resolve, reject) => {
        const authenticator = new Authenticator({
            consumerKey: consumer_key,
            consumerSecret: consumer_secret,
            callback: "http://example.com",
        });

        authenticator.getRequestToken((error, request_token, request_token_secret) => {

            if (error) {
                reject(error);
                return;
            }

            let login_window = new BrowserWindow({
                width: 800,
                height: 600,
                "web-preference": {
                    "web-security": true,
                },
            });

            login_window.webContents.on("will-navigate", (event: Event, url: string) => {
                event.preventDefault();

                const match = url.match(/\?oauth_token=([^&]*)&oauth_verifier=([^&]*)/);
                if (!match) {
                    return;
                }

                authenticator.getAccessToken(request_token, request_token_secret, match[2], (err, access_token, access_token_secret) => {
                    console.log("access token: " + access_token);

                    if (err) {
                        setTimeout(() => login_window.close(), 0);
                        reject(err);
                        return;
                    }

                    resolve({
                        access_token: access_token,
                        access_token_secret: access_token_secret,
                    });

                    setTimeout(() => login_window.close(), 0);
                });
            });

            login_window.on("closed", () => {
                login_window = null;
            });

            const login_url = authenticator.getAuthUrl(request_token);
            console.log("Start authentication: " + login_url);
            login_window.loadUrl(login_url);
        });
    });
}
