/// <reference path="../../../typings/globals/node/index.d.ts" />
/// <reference path="../../../typings/globals/q/index.d.ts" />
/// <reference path="../../../typings/globals/webdriverio/index.d.ts" />
/// <reference path="../../../typings/globals/github-electron/electron-prebuilt/index.d.ts" />

declare namespace WebdriverIO {
    export interface ConsoleMessage {
        level: string;
        message: string;
        source: string;
        timestamp: number;
    }
    export interface Client<T> {
        getMainProcessLogs(): Promise<string[]>;
        getRenderProcessLogs(): Promise<ConsoleMessage[]>;
        getSelectedText(): Promise<string>;
        getWindowCount(): Promise<number>;
        waitUntilTextExists(selector: string, text: string, timeout?: number): Promise<void>;
        waitUntilWindowLoaded(timeout?: number): Promise<void>;
        windowByIndex(index: number): any;
    }
}
declare module 'spectron' {
    export interface ApplicationOptions {
        path: string;
        args?: string[];
        cwd?: string;
        env?: Object;
        host?: string;
        port?: number;
        nodePath?: string;
        connectionRetryCount?: number;
        connectionRetryTimeout?: number;
        quitTimeout?: number;
        requireName?: string;
        startTimeout?: number;
        waitTimeout?: number;
    }
    export class Application {
        client: WebdriverIO.Client<void>;
        electron: any;
        browserWindow: any;
        webContents: any;
        mainProcess: any;
        rendererProcess: any;

        constructor(options: ApplicationOptions);
        start(): void;
        stop(): void;
        restart(): void;
        isRunning(): boolean;
    }
}
