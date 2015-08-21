declare module Twitter {
    interface AuthInfo {
        consumer_key: string;
        consumer_secret: string;
        access_token_key: string;
        access_token_secret: string;
    }

    export interface TwitterStream {
        on(event_name: string, callback: (param: Object | Error) => void): TwitterClient;
    }

    export class TwitterClient {
        constructor(auth: AuthInfo);
        get(path: string, opt?: Object, callback?: (err: Error, tweets: Object[], response: any) => void): TwitterClient;
        post(url: string, content?: Object, content_type?: string, callback?: (data: any) => void): TwitterClient;
        verifyCredentials(callback: (data: any) => void): TwitterClient;

        search(query: string, params?: Object, callback?: (data: any) => void): TwitterClient;
        stream(path: string, params?: Object, callback?: (stream: TwitterStream) => void): TwitterClient;

        updateStatus(text: string, params?: Object, callback?: (data: any) => void): TwitterClient;
        showStatus(id: string, callback: (data: any) => void): TwitterClient;

        getHomeTimeline(params: Object, callback: (data: any) => void): TwitterClient;
        getMentions(params: Object, callback: (data: any) => void): TwitterClient;
        getRetweetedByMe(params: Object, callback: (data: any) => void): TwitterClient;
        getRetweetedToMe(params: Object, callback: (data: any) => void): TwitterClient;
        getRetweetsOfMe(params: Object, callback: (data: any) => void): TwitterClient;
        getUserTimeline(params: Object, callback: (data: any) => void): TwitterClient;
        getRetweetedToUser(params: Object, callback: (data: any) => void): TwitterClient;
        getRetweetedByUser(params: Object, callback: (data: any) => void): TwitterClient;

        searchUser(query: string, params?: Object, callback?: (data: any) => void): TwitterClient;
        userProfileImage(id: string, params?: Object, callback?: (url: string) => void): TwitterClient;

        getTrends(callback: (data: any) => void): TwitterClient;
        getCurrentTrends(params?: Object, callback?: (data: any) => void): TwitterClient;
        getDailyTrends(params?: Object, callback?: (data: any) => void): TwitterClient;
        getWeeklyTrends(params?: Object, callback?: (data: any) => void): TwitterClient;

        cookie(req: any): any;
        login(mount: string, success: string): void;

        // TODO: ... Add more APIs
    }
}


declare module "twitter" {
    var tw: typeof Twitter.TwitterClient;
    export = tw;
}
