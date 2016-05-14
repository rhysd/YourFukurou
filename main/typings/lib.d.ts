/// <reference path="../../typings/main.d.ts" />

interface AccessToken {
    token: string;
    token_secret: string;
}

declare namespace ElectronWindowState {
    interface WindowState {
        x: number;
        y: number;
        width: number;
        height: number;
        isMaximized: boolean;
        isFullScreen: boolean;
        manage(win: Electron.BrowserWindow): void;
        saveState(win: Electron.BrowserWindow): void;
    }
    interface WindowStateKeeperOptions {
        defaultWidth?: number;
        defaultHeight?: number;
        path?: string;
        file?: string;
        maximize?: boolean;
        fullScreen?: boolean;
    }
}

declare module 'electron-window-state' {
    function windowStateKeeper(opts: ElectronWindowState.WindowStateKeeperOptions): ElectronWindowState.WindowState;
    export = windowStateKeeper;
}

declare module NodeJS {
    interface Global {
        config?: Config;
        config_path?: string;
    }
}

interface ObjectConstructor {
    assign<T, U>(o1: T, o2: U): T & U;
    assign<T, U, V>(o1: T, o2: U, o3: V): T & U & V;
    assign<T, U, V, W>(o1: T, o2: U, o3: V, o4: W): T & U & V & W;
    assign<T, U, V, W, X>(o1: T, o2: U, o3: V, o4: W, o5: X): T & U & V & W & X;
    assign<T, U, V, W, X, Y>(o1: T, o2: U, o3: V, o4: W, o5: X, o6: Y): T & U & V & W & X & Y;
    assign<T, U, V, W, X, Y, Z>(o1: T, o2: U, o3: V, o4: W, o5: X, o6: Y, o7: Z): T & U & V & W & X & Y & Z;
    assign(target: any, ...source: any[]): any;
}
