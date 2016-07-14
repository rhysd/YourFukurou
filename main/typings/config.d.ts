interface NotificationConfig {
    readonly reply: boolean;
    readonly retweet: boolean;
    readonly quoted: boolean;
    readonly like: boolean;
}

interface MuteConfig {
    readonly home: boolean;
    readonly mention: boolean;
}

interface Config {
    readonly notification: boolean | NotificationConfig;
    readonly notification_sound: boolean | string;
    readonly hotkey_accelerator: string | null;
    readonly expand_tweet: 'always' | 'focused' | 'never';
    readonly plugin: string[];
    readonly mute: boolean | MuteConfig;
    readonly max_timeline_items: number | null;
    readonly proxy: string | null;
    readonly sticky_window: boolean;
    readonly caffeinated: boolean;
}
