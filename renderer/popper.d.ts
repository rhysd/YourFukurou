declare namespace Popper {
    export interface PopperOptions {
        placement?: string;
        gpuAcceleration?: boolean;
        offset?: number;
        boundariesElement?: string | HTMLElement;
        boundariesPadding?: number;
        preventOverflowOrder?: ('left' | 'right' | 'top' | 'bottom')[];
        flipBehavior?: string | string[];
        modifiers?: string[];
        modifiersIgnored?: string[];
        removeOnDestroy?: boolean;
        arrowElement?: string | HTMLElement;
    }
    export class Modifiers {
        applyStyle(data: Object): Object;
        shift(data: Object): Object;
        preventOverflow(data: Object): Object;
        keepTogether(data: Object): Object;
        flip(data: Object): Object;
        offset(data: Object): Object;
        arrow(data: Object): Object;
    }
    export interface Data {
        placement: string;
        offsets: {
            popper: {
                position: string;
                top: number;
                left: number;
            };
        };
    }
}

declare module 'popper.js' {
    class Popper {
        public modifiers: Popper.Modifiers;
        public placement: string;

        constructor(reference: HTMLElement, popper: HTMLElement | Object, options?: Popper.PopperOptions);

        destroy(): void;
        update(): void;
        onCreate(cb: (data: Popper.Data) => void): void;
        onUpdate(cb: (data: Popper.Data) => void): void;
        parse(config: Object): HTMLElement;
        runModifiers(data: Object, modifiers: string[], ends: Function): void;
        isModifierRequired(): boolean;
    }
    export = Popper;
}
