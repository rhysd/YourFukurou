declare module 'timing.js' {
    export interface TimingAPI {
        // Total time from start to load
        loadTime: number;
        // Time spent constructing the DOM tree
        domReadyTime: number;
        // Time consumed preparing the new page
        readyStart: number;
        // Time spent during redirection
        redirectTime: number;
        // AppCache
        appcacheTime: number;
        // Time spent unloading documents
        unloadEventTime: number;
        // DNS query time
        lookupDomainTime: number;
        // TCP connection time
        connectTime: number;
        // Time spent during the request
        requestTime: number;
        // Request to completion of the DOM loading
        initDomTreeTime: number;
        // Load event time
        loadEventTime: number;
    }

    interface PrintOptions {
        simple?: boolean;
    }

    export function getTimes(opts?: PrintOptions): TimingAPI | boolean;
    export function printTable(opts?: PrintOptions): void;
    export function printSimpleTable(): void;
}
