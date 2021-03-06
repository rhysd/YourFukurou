/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/immutable/dist/immutable.d.ts" />
/// <reference path="../../node_modules/dexie/dist/dexie.d.ts" />

declare namespace NodeJS {
    interface Global {
        require: NodeRequireFunction;
        DB: any;                            // For debug purpose
        PM: any;                            // For debug purpose
        emitHomeStatusesJson?: () => void;  // For debug purpose
    }
}

declare module 'why-did-you-update' {
    interface Options {
        include?: RegExp;
        exclude?: RegExp;
    }
    export function whyDidYouUpdate(react: typeof __React, options?: Options): void;
}

/*
 * Shims for ES2015 APIs
 */

type IdleCallbackHandle = number;
interface Window {
    requestIdleCallback(callback: (timeRemaining: number, didTimeout: boolean) => void, options?: Object): IdleCallbackHandle;
    cancelIdleCallback(handle: IdleCallbackHandle): void;
}

