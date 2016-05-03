// Type definitions for HTML Web Notification API.
// https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationOptions {
    dir?: 'auto' | 'ltr' | 'rtl';
    lang?: string;
    body?: string;
    tag?: string;
    icon?: string;
    data?: any;
    silent?: boolean;

    sound?: string;
    vibrate?: number | number[];
    noscreen?: boolean;
    sticky?: boolean;
    renotify?: boolean;
}

declare class Notification {
    dir: 'auto' | 'ltr' | 'rtl';
    lang: string;
    body: string;
    tag: string;
    icon: string;
    data: any;
    silent: boolean;

    sound: string;
    vibrate: number | number[];
    noscreen: boolean;
    sticky: boolean;
    renotify: boolean;

    permission: NotificationPermission;
    title: string;
    onclick: (e: MouseEvent) => void;
    onshow: (e: Event) => void;
    onclose: (e: Event) => void;
    onerror: (e: Error) => void;

    static requestPermission(): Promise<NotificationPermission>;

    constructor(title: string, options?: NotificationOptions);

    addEventListener(event: string, cb: Function): void;
    addEventListener(event: 'click', cb: (e: MouseEvent) => void): void;
    addEventListener(event: 'error', cb: (e: Error) => void): void;
    addEventListener(event: 'show', cb: (e: Event) => void): void;
    addEventListener(event: 'close', cb: (e: Event) => void): void;
    close();
}
