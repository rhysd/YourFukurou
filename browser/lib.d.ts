/// <reference path="../typings/tsd.d.ts" />

declare module StreamApp {
    class RawSource {
        constructor(output: (data: any) => void);
    }
}

declare module NodeJS {
    interface Global {
        load_paths: string[];
    }
}

