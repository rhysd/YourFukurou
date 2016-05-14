declare module 'node-emoji' {
    export const emoji: {
        [short_name: string]: string;
    };

    export function get(name: string): string;
    export function which(code: string): string;
    export function emojify(str: string): string;
}
