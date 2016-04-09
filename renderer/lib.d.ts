/// <reference path="../typings/main.d.ts" />

declare module NodeJS {
    interface Global {
        require: NodeRequireFunction;
    }
}

