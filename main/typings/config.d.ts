interface NotificationConfig {
    reply: boolean;
    retweet: boolean;
    quoted: boolean;
    like: boolean;
}

interface MuteConfig {
    home: boolean;
    mention: boolean;
}

interface Config {
    notification: boolean | NotificationConfig;
    notification_sound: boolean | string;
    hotkey_accelerator: string | null;
    expand_tweet: 'always' | 'focused' | 'never';
    plugin: string[];
    mute: boolean | MuteConfig;
    max_timeline_items: number | null;
    proxy: string | null;
    sticky_window: boolean;
    caffeinated: boolean;
}
