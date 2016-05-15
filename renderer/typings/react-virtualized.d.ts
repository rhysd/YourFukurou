declare module 'react-virtualized' {
    import React = __React;

    export interface GridProps extends React.Props<Grid> {
        cellRenderer: (arg: {columnIndex: number, isScrolling: boolean, rowIndex: number}) => React.ReactElement<any>;
        columnCount: number;
        columnWidth: number | ((_: {index: number}) => number);
        height: number;
        width: number;
        rowCount: number;
        rowHeight: number | ((_: {index: number}) => number);
        cellRangeRenderer?: Function;
        className?: string;
        noContentRenderer?: Function;
        onSectionRendered?: Function;
        onScroll?: Function;
        overscanColumnCount?: number;
        overscanRowCount?: number;
        scrollLeft?: number;
        scrollToColumn?: number;
        scrollToRow?: number;
        scrollTop?: number;
        style?: React.CSSProperties;
    }
    export class Grid extends React.Component<GridProps, {}> {
        recomputeGridSize(): void;
    }

    export interface VirtualScrollProps extends React.Props<VirtualScroll> {
        height: number;
        width: number;
        rowHeight: number;
        rowRenderer: (arg: {index: number, isScrolling: number}) => React.ReactElement<any> | string;
        rowCount: number;
        className?: string;
        noRowsRenderer?: Function;
        onRowsRendered?: Function;
        onScroll?: Function;
        overscanRowCount?: number;
        scrollToIndex?: number;
        scrollTop?: number;
        style?: React.CSSProperties;
    }
    export class VirtualScroll extends React.Component<VirtualScrollProps, {}> {
        recomputeRowHeights(): void;
    }

    export interface AutoSizerProps extends React.Props<AutoSizer> {
        children?: (size: {height: number, width: number}) => React.ReactElement<VirtualScroll>;
        disableHeight?: boolean;
        disableWidth?: boolean;
        onResize?: (size: {height: number, width: number}) => React.ReactElement<VirtualScroll>;
    }
    export class AutoSizer extends React.Component<AutoSizerProps, {}> {}

    export interface CellMeasurerProps extends React.Props<CellMeasurer> {
        cellRenderer: (_: {columnIndex: number, rowIndex: number}) => React.ReactElement<any>;
        columnCount: number;
        rowCount: number;
        children?: (_: {getColumnWidth: (_: {index: number}) => number, getRowHeight: (_: {index: number}) => number, resetMeasurements: Function}) => React.ReactElement<any>;
        container?: React.ReactElement<any> | Function;
        height?: number;
        width?: number;
    }
    export class CellMeasurer extends React.Component<CellMeasurerProps, {}> {}

    // TODO:
    // Add more components
}
