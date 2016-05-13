/// <reference path="../typings/main.d.ts" />
/// <reference path="../main/channel.d.ts" />
/// <reference path="../main/config.d.ts" />
/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />
/// <reference path="../node_modules/dexie/dist/dexie.d.ts" />

declare module NodeJS {
    interface Global {
        require: NodeRequireFunction;
        DB: any;  // For debug purpose
        PM: any;  // For debug purpose
    }
}

interface String {
    includes: (sub: string) => boolean;
    startsWith: (sub: string, pos?: number) => boolean;
    endsWith: (sub: string, pos?: number) => boolean;
}

declare module 'why-did-you-update' {
    interface Options {
        include?: RegExp;
        exclude?: RegExp;
    }
    export function whyDidYouUpdate(react: typeof __React, options?: Options): void;
}
