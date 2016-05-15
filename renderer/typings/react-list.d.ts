declare namespace ReactList {
    import React = __React;
    export interface Props extends React.Props<any> {
        itemRenderer: (index: number, key: string) => React.ReactElement<ReactList>;
        length: number;
        type?: 'simple' | 'uniform' | 'variable';
        axis?: 'x' | 'y';
        itemSizeGetter?: (index: number) => number;
        itemsRenderer?: (items: any[], ref: Element) => React.ReactElement<any>;
        pageSize?: number;
        scrollParentGetter?: () => Window | Element;
        threshold?: number;
        useTranslate3d?: boolean;
    }
}

declare class ReactList extends __React.Component<ReactList.Props, {}> {
    scrollTo(index: number): void;
    scrollAround(index: number): void;
    getVisibleRange(): [number, number];
}

declare module 'react-list' {
    export = ReactList;
}
