declare module 'rc-tooltip' {
    import React = __React;

    export type Trigger = 'hover' | 'click' | 'focus';
    export type Placement =
        'left' | 'right' | 'top' | 'bottom' |
        'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

    export interface TooltipProps extends React.Props<Tooptip> {
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

    export default class Tooptip extends React.Component<TooltipProps, {}> {}
}
