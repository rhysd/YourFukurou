interface UserJson {
    utc_offset: number;
    listed_count: number;
    profile_use_background_image: boolean;
    profile_image_url_https: string;
    profile_background_image_url_https: string;
    created_at: string;
    name: string;
    profile_sidebar_fill_color: string;
    profile_background_image_url: string;
    profile_image_url: string;
    following: any;
    lang: string;
    friends_count: number;
    url: any;
    protected: boolean;
    favourites_count: number;
    id_str: string;
    is_translator: boolean;
    screen_name: string;
    geo_enabled: boolean;
    profile_background_color: string;
    profile_banner_url: string;
    location: string;
    profile_link_color: string;
    default_profile_image: boolean;
    time_zone: string;
    statuses_count: number;
    follow_request_sent: any;
    id: number;
    notifications: any;
    description: string;
    profile_background_tile: boolean;
    profile_text_color: string;
    default_profile: boolean;
    followers_count: number;
    verified: boolean;
    profile_sidebar_border_color: string;
    contributors_enabled: boolean;
}

interface TweetJson {
    entities?: {
        media: {
            type: string;
            source_status_id_str: string;
            expanded_url: string;
            id: number;
            indices: [number, number];
            source_user_id_str: string;
            url: string;
            id_str: string;
            source_status_id: number;
            media_url_https: string;
            source_user_id: number;
            sizes: {
                large: {
                    h: number;
                    resize: string;
                    w: number;
                };
                medium: {
                    w: number;
                    h: number;
                    resize: string;
                };
                small: {
                    h: number;
                    resize: string;
                    w: number;
                };
                thumb: {
                    h: number;
                    resize: string;
                    w: number;
                };
            };
            media_url: string;
            display_url: string;
        }[];
        symbols: string[];
        urls: {
            url: string;
            expanded_url: string;
            display_url: string;
            indices: [number, number];
        }[];
        user_mentions: {
            id: number;
            id_str: string;
            indices: [number, number];
            name: string;
            screen_name: string;
        }[];
        hashtags: {
            text: string,
            indices: [number, number]
        }[];
    };
    contributors: any;
    possibly_sensitive: boolean;
    timestamp_ms: string;
    in_reply_to_status_id_str: string;
    text: string;
    id_str: string;
    in_reply_to_user_id: number;
    lang: string;
    truncated: boolean;
    coordinates: any;
    in_reply_to_status_id: number;
    retweeted: boolean;
    place: any;
    favorited: boolean;
    filter_level: string;
    in_reply_to_user_id_str: string;
    is_quote_status: boolean;
    extended_entities: {
        media: {
            source_status_id_str: string;
            source_user_id: number;
            id: number;
            type: string;
            url: string;
            display_url: string;
            source_status_id: number;
            media_url_https: string;
            source_user_id_str: string;
            indices: [number, number];
            id_str: string;
            expanded_url: string;
            media_url: string;
            sizes: {
                large: {
                    w: number;
                    h: number;
                    resize: string;
                };
                medium: {
                    resize: string;
                    w: number;
                    h: number;
                };
                small: {
                    w: number;
                    h: number;
                    resize: string;
                };
                thumb: {
                    h: number;
                    resize: string;
                    w: number;
                };
            };
        }[];
    };
    in_reply_to_screen_name: string;
    id: number;
    favorite_count: number;
    created_at: string;
    source: string;
    retweet_count: number;
    geo: any;
    retweeted_status?: TweetJson;
    user: UserJson;
    quoted_status?: TweetJson;
}

interface DeleteJson {
    status: {
        id: number;
        id_str: string;
        user_id: number;
        user_id_str: string;
    };
    timestamp_ms: string;
}
