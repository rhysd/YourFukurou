declare namespace LoglevelMessagePrefix {
    export interface MessagePrefixPlugin {
        prefixes?: ('timestamp' | 'level')[];
        staticPrefixes?: string[];
        prefixFormat?: string;
        separator?: string;
        options?: {
            timestamp?: {
                locale?: string;
                timezone?: string;
                hour12?: boolean;
            };
        };
    }
    export function applyPlugin(log: Log, options?: MessagePrefixPlugin): Log;
}

declare module 'loglevel-message-prefix' {
    const main: typeof LoglevelMessagePrefix.applyPlugin;
    export = main;
}
