declare module 'twit' {

    import {IncomingMessage} from 'http';
    import {EventEmitter} from 'events';

    namespace Twit {
        export type StreamEndpoint = 'statuses/filter' | 'statuses/sample' | 'statuses/firehose' | 'user' | 'site';

        export namespace Twitter {
            export type ResultType = 'mixed' | 'popular' | 'recent';

            // See https://dev.twitter.com/overview/api/tweets#obj-contributors
            export interface Contributors {
                id: number;
                id_str: number;
                screen_name: string;
            }

            // See https://dev.twitter.com/overview/api/entities
            export interface HashtagEntity {
                indices: [number, number];
                text: string;
            }
            export interface Size {
                h: number;
                w: number;
                resize: 'crop' | 'fit';
            }
            export interface Sizes {
                large: Size;
                medium: Size;
                small: Size;
                thumb: Size;
            }
            export interface VideoVariant {
                bitrate?: number;
                content_type: string;
                url: string;
            }
            export interface VideoInfo {
                aspect_ratio: [number, number];
                duration_millis?: number;
                variants: VideoVariant[];
            }
            export interface MediaEntity {
                display_url: string;
                expanded_url: string;
                id: number;
                id_str: string;
                indices: [number, number];
                media_url: string;
                media_url_https: string;
                sizes: Sizes;
                source_status_id?: number;
                source_status_id_str?: string;
                type: string;
                url: string;
                video_info?: VideoInfo;
            }
            export interface UrlEntity {
                display_url: string;
                expanded_url: string;
                indices: [number, number] | null;
                url: string;
            }
            export interface UserMentionEntity {
                id: number;
                id_str: string;
                indices: [number, number];
                name: string;
                screen_name: string;
            }
            export interface SymbolEntity {
                indices: [number, number];
                text: string;
            }
            export interface Entities {
                hashtags?: HashtagEntity[];
                media?: MediaEntity[];
                symbols?: SymbolEntity[];
                urls?: UrlEntity[];
                user_mentions?: UserMentionEntity[];
            }
            export interface UserEntities {
                description?: Entities;
                url?: Entities;
            }

            // See https://dev.twitter.com/overview/api/users
            export interface User {
                contributors_enabled: boolean;
                created_at: string;
                default_profile: boolean;
                default_profile_image: boolean;
                description: string;
                entities: UserEntities;
                favourites_count: number;
                follow_request_sent?: boolean;
                followers_count: number;
                following?: boolean;
                friends_count: number;
                geo_enabled?: boolean;
                id: number;
                id_str: string;
                is_translator?: boolean;
                lang: string;
                listed_count: number;
                location: string;
                name: string;
                notifications?: boolean;
                profile_background_color: string;
                profile_background_image_url: string;
                profile_background_image_url_https: string;
                profile_background_tile: boolean;
                profile_banner_url?: string;
                profile_image_url: string;
                profile_image_url_https: string;
                profile_link_color: string;
                profile_sidebar_border_color: string;
                profile_sidebar_fill_color: string;
                profile_text_color: string;
                profile_use_background_image: boolean;
                protected: boolean;
                screen_name: string;
                show_all_inline_media?: boolean;
                status?: Status;
                statuses_count: number;
                time_zone?: string;
                url: string;
                utc_offset?: number;
                verified: boolean;
                withheld_in_countries?: string;
                withheld_scope?: string;
            }

            // See https://dev.twitter.com/overview/api/places
            export interface PlaceAttribute {
                'app:id': string;
                iso3: string;
                locality: string;
                phone: string;
                postal_code: string;
                region: string;
                street_address: string;
                twitter: string;
                url: string;
            }
            export interface Place {
                attributes: PlaceAttribute;
                bounding_box: GeoJSON.Polygon;
                contained_within: Place[];
                country: string;
                country_code: string;
                full_name: string;
                geometry: GeoJSON.Point;
                id: string;
                name: string;
                place_type: string;
                url: string;
            }

            // See https://dev.twitter.com/overview/api/tweets
            export interface Status {
                id: number;
                id_str: string;
                annotations?: Object;
                contributors?: Contributors[];
                coordinates?: GeoJSON.Point;
                current_user_retweet?: {
                    id: number;
                    id_str: number;
                };
                created_at: string;
                entities: Entities;
                extended_entities: Entities;
                favorite_count: number;
                favorited: boolean;
                filter_level: 'none' | 'low' | 'medium';
                geo?: Object;
                in_reply_to_screen_name?: string;
                in_reply_to_status_id?: number;
                in_reply_to_status_id_str?: string;
                in_reply_to_user_id?: number;
                in_reply_to_user_id_str?: string;
                is_quote_status: boolean;
                lang?: string;
                place?: Place;
                possibly_sensitive?: boolean;
                quoted_status?: Status;
                quoted_status_id?: number;
                quoted_status_id_str?: string;
                retweet_count: number;
                retweeted: boolean;
                retweeted_status?: Status;
                scopes?: Object;
                source?: string;
                text: string;
                truncated: boolean;
                user: User;
                withheld_copyright?: boolean;
                withheld_in_countries?: string[];
                withheld_scope?: string;
            }
            interface DirectMessage {
                created_at: string;
                entities: Entities;
                id: number;
                id_str: string;
                recipient: User;
                recipient_id: number;
                recipient_screen_name: string;
                sender: User;
                sender_id: number;
                sender_screen_name: string;
                text: string;
            }
            export interface Metadata {
                completed_in?: number;
                count?: number;
                max_id?: number;
                max_id_str?: string;
                next_results?: string;
                query?: string;
                refresh_url?: string;
                since_id?: number;
                since_id_str?: string;
            }
            export interface SearchResponse {
                search_metadata: Metadata;
                statuses: Status[];
            }
            export interface Error {
                code: number;
                message: string;
            }
            export interface StreamingDeleteStatus {
                id: number;
                id_str: string;
                user_id: number;
                user_id_str: string;
            }
            export interface StreamingDeleteEvent {
                delete: {
                    status: StreamingDeleteStatus;
                    timestamp: string;
                };
            }
            export interface StreamingFriendsEvent {
                friends: number[] | string[];
            }
            export interface StreamingLimitEvent {
                limit: {
                    track: number;
                };
            }
            export interface StreamingDisconnectEvent {
                disconnect: {
                    code: number;
                    reason: string;
                    stream_name: string;
                };
            }
            export interface StreamingWarningEvent {
                warning: {
                    code: string;
                    message: string;
                    percent_full: number;
                };
            }
            export interface StreamEvent {
                created_at: string;
                event: string;
                source?: User;
                target?: User;
                target_object?: any;
            }
        }

        interface MediaParam {
            file_path: string;
        }
        interface Params {
            // search/tweets
            q?: string;
            geocode?: string;
            lang?: string;
            locale?: string;
            result_type?: Twitter.ResultType;
            count?: number;
            results_per_page?: number;
            until?: string;
            since_id?: string;
            max_id?: string;
            include_entities?: boolean;

            // Other params from various endpoints
            media_id?: string;
            media_ids?: string[];
            alt_text?: {
                text?: string
            };
            media_data?: Buffer | string;
            screen_name?: string;
            id?: string;
            slug?: string;
            status?: string;
        }
        export interface PromiseResponse {
            data: any;
            responde: IncomingMessage;
        }
        export interface ConfigKeys {
            consumer_key: string;
            consumer_secret: string;
            access_token?: string;
            access_token_secret?: string;
        }
        export interface Options extends ConfigKeys {
            app_only_auth?: boolean;
            timeout_ms?: number;
            trusted_cert_fingerprints?: string[];
        }
        export interface ApiError extends Error {
            allErrors: Twitter.Error[];
            code: number;
            statusCode: number;
            twitterReply: IncomingMessage;
        }
        export type Callback = (err: ApiError, result: any, response: IncomingMessage) => void;

        export class Stream extends EventEmitter {
            start(): void;
            stop(): void;
            on(event: 'blocked', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'connect', cb: (request: any) => void): this;
            on(event: 'connected', cb: (response: IncomingMessage) => void): this;
            on(event: 'delete', cb: (e: Twitter.StreamingDeleteEvent) => void): this;
            on(event: 'direct_message', cb: (msg: any) => void): this;
            on(event: 'disconnect', cb: (d: Twitter.StreamingDisconnectEvent) => void): this;
            on(event: 'error', cb: (e: Twit.ApiError) => void): this;
            on(event: 'favorite', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'favorited_retweet', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'follow', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'friends', cb: (friend_ids: Twitter.StreamingFriendsEvent) => void): this;
            on(event: 'limit', cb: (l: Twitter.StreamingLimitEvent) => void): this;
            on(event: 'list_created', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'list_destroyed', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'list_member_added', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'list_member_removed', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'list_updated', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'list_user_subscribed', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'list_user_unsubscribed', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'message', cb: (msg: any) => void): this;
            on(event: 'quoted_tweet', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'reconnect', cb: (request: any, response: IncomingMessage, connectInterval: number) => void): this;
            on(event: 'retweeted_retweet', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'scrub_geo', cb: (msg: any) => void): this;
            on(event: 'status_withheld', cb: (msg: any) => void): this;
            on(event: 'tweet', cb: (tw: Twitter.Status) => void): this;
            on(event: 'unblocked', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'unfavorite', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'unfollow', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'unknown_user_event', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'user_event', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'user_update', cb: (e: Twitter.StreamEvent) => void): this;
            on(event: 'user_withheld', cb: (msg: any) => void): this;
            on(event: 'warning', cb: (warning: Twitter.StreamingWarningEvent) => void): this;
            on(event: string, cb: Function): this;
        }
    }

    class Twit {
        // See https://github.com/ttezel/twit#var-t--new-twitconfig
        constructor(config: Twit.Options);

        // See https://github.com/ttezel/twit#tgetpath-params-callback
        get(path: string, callback: Twit.Callback): void;
        get(path: string, params: Twit.Params, callback: Twit.Callback): void;
        get(path: string, params?: Twit.Params): Promise<Twit.PromiseResponse>;

        // See https://github.com/ttezel/twit#tpostpath-params-callback
        post(path: string, callback: Twit.Callback): void;
        post(path: string, params: Twit.Params, callback: Twit.Callback): void;
        post(path: string, params?: Twit.Params): Promise<Twit.PromiseResponse>;

        // See https://github.com/ttezel/twit#tpostmediachunkedparams-callback
        postMediaChunked(media: Twit.MediaParam, callback: Twit.Callback): void;

        // See https://github.com/ttezel/twit#tgetauth
        getAuth(): Twit.Options;
        // See https://github.com/ttezel/twit#tsetauthtokens
        setAuth(tokens: Twit.ConfigKeys): void;

        // See https://github.com/ttezel/twit#tstreampath-params
        stream(path: Twit.StreamEndpoint, params?: Twit.Params): Twit.Stream;
    }

    export = Twit;
}

