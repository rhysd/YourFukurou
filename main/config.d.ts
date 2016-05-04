interface NotificationConfig {
    reply: boolean;
    retweet: boolean;
    quoted: boolean;
}

interface Config {
    notification: boolean | NotificationConfig;
    plugin: string[];
}
