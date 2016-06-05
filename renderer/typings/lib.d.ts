/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../node_modules/immutable/dist/immutable.d.ts" />
/// <reference path="../../node_modules/dexie/dist/dexie.d.ts" />

declare module NodeJS {
    interface Global {
        require: NodeRequireFunction;
        DB: any;  // For debug purpose
        PM: any;  // For debug purpose
    }
}

declare module 'why-did-you-update' {
    interface Options {
        include?: RegExp;
        exclude?: RegExp;
    }
    export function whyDidYouUpdate(react: typeof __React, options?: Options): void;
}

declare namespace Redux {
    interface DispatchProps {
        dispatch: Redux.Dispatch;
    }
}

/*
 * Shims for ES2015 APIs
 */

interface String {
    includes: (sub: string) => boolean;
    startsWith: (sub: string, pos?: number) => boolean;
    endsWith: (sub: string, pos?: number) => boolean;
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

type IdleCallbackHandle = number;
interface Window {
    requestIdleCallback(callback: (timeRemaining: number, didTimeout: boolean) => void, options?: Object): IdleCallbackHandle;
    cancelIdleCallback(handle: IdleCallbackHandle): void;
}

interface ScrollIntoViewOptions {
    behavior?: 'auto' | 'instant' | 'smooth';
    block?: 'start' | 'end';
}

interface Element {
    scrollIntoView(options?: boolean | ScrollIntoViewOptions): void;
}
