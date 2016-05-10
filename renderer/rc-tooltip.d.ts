declare namespace Tooltip {
    import React = __React;

    export type Trigger = 'hover' | 'click' | 'focus';
    export type Placement =
        'left' | 'right' | 'top' | 'bottom' |
        'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

    export interface Props extends React.Props<any> {
        overlayClassName?: string;
        trigger?: Trigger[];
        mouseEnterDelay?: number;
        mouseLeaveDelay?: number;
        overlayStyle?: React.CSSProperties;
        prefixCls?: string;
        transitionName?: string;
        onVisibleChange?: () => void;
        visible?: boolean;
        defaultVisible?: boolean;
        placement?: Placement | Object;
        align?: Object;
        onPopupAlign?: (popupDomNode: Element, align: Object) => void;
        overlay?: React.ReactElement<any>;
        arrowContent?: React.ReactNode;
        getTooltipContainer?: () => Element;
        destroyTooltipOnHide?: boolean;
    }
}

declare module 'rc-tooltip' {
    export = class Tooptip extends __React.Component<Tooltip.Props, {}> {}
}
