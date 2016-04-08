declare module TwitterAPI {
    interface OAuthInfo {
        consumerKey: string;
        consumerSecret: string;
        callback?: string;
    }

    export class Authenticator {
        constructor(tokens: OAuthInfo);
        getRequestToken(callback: (err: Error, requestToken: string, requestTokenSecret: string) => void): any;
        getAuthUrl(request_token: string): string;
        getAccessToken(request_token: string, request_token_secret: string, verifier: string, callback: (error: Error, access_token: string, access_token_secret: string) => void): void;
    }
}

declare module 'node-twitter-api' {
    var tw: typeof TwitterAPI.Authenticator;
    export = tw;
}
