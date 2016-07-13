declare module 'oauth' {
    type RequestTokenCallback = (err: Error, token: string, tokenSecret: string, response: Object) => void;
    export class OAuth {
        constructor(
            requestToken: string,
            accessToken: string,
            consumerKey: string,
            consumerSecret: string,
            version: string,
            authorizeCallback: string,
            signatureMethod: string,
            nonceSize?: number,
            customHeaders?: Object,
        );
        setClientOptions(options: Object): void;
        getOAuthAccessToken(
            oauthToken: string,
            oauthTokenSecret: string,
            oauthVerifier: string,
            callback: RequestTokenCallback,
        ): void;
        getProtectedResource(
            url: string,
            method: string,
            accessToken: string,
            accessTokenSecret: string,
            callback: Function,
        ): void;
        delete(
            url: string,
            oauth_token: string,
            oauth_token_secret: string,
            callback: Function,
        ): void;
        get(
            url: string,
            oauth_token: string,
            oauth_token_secret: string,
            callback: Function,
        ): void;
        put(
            url: string,
            oauth_token: string,
            oauth_token_secret: string,
            post_body: any,
            post_content_type: any,
            callback: Function,
        ): void;
        getOAuthRequestToken(
            extraParams: Object,
            callback: RequestTokenCallback,
        ): void;
        getOAuthRequestToken(
            callback: RequestTokenCallback,
        ): void;
        signUrl(
            url: string,
            oauth_token: string,
            oauth_token_secret: string,
            method: string,
        ): string;
        autoHeader(
            url: string,
            oauth_token: string,
            oauth_token_secret: string,
            method: string,
        ): Object;
    }

    // TODO:
    // Add OAuth2
}
