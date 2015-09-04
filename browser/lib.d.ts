/// <reference path="../typings/tsd.d.ts" />

declare module StreamApp {
    interface RawSource {
        constructor(output: (data: any) => void): void;
        initialize?: () => void;
    }
}

declare module NodeJS {
    interface Global {
        load_paths: string[];
        sources: StreamApp.RawSource[];
    }
}

