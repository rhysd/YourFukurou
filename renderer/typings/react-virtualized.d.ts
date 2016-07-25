declare module 'react-virtualized' {
    import React = __React;

    export interface AutoSizerProps {
        disableHeight?: boolean;
        disableWidth?: boolean;
        onResize?: (size: {
            height: number;
            width: number;
        }) => void;
    }
    export class AutoSizer extends React.Component<AutoSizerProps, {}> {}
    export interface AutoSizerChild {
        (size: {
            height: number;
            width: number;
        }): JSX.Element | undefined;
    }

    export interface CellMeasurerProps {
        cellRenderer: (indices: {
            columnIndex: number;
            rowIndex: number;
        }) => JSX.Element | undefined;
        columnCount: number;
        rowCount: number;
        width?: number;
        height?: number;
        container?: React.ReactNode | React.ComponentClass<any> | (() => React.ReactNode | React.ComponentClass<any>);
    }
    export class CellMeasurer extends React.Component<CellMeasurerProps, {}> {}
    export interface CellMeasurerChild {
        (args: {
            getColumnWidth: () => number;
            getRowHeight: () => number;
            resetMeasurements: () => void;
        }): JSX.Element | undefined;
    }

    export interface VirtualScrollProps {
        height: number;
        width: number;
        rowHeight: number | ((arg: {index: number}) => number);
        rowRenderer: (args: {
            index: number;
            isScrolling: boolean;
        }) => JSX.Element | undefined;
        rowCount: number;
        className?: string;
        estimatedRowSize?: number;
        noRowsRenderer?: () => React.ReactElement<any>;
        onRowsRendered?: (args: {
            overscanStartIndex: number;
            overscanTopIndex: number;
            startIndex: number;
            stopIndex: number;
        }) => void;
        onScroll?: (args: {
            clientHeight: number;
            scrollHeight: number;
            scrollTop: number;
        }) => void;
        overscanRowCount?: number;
        rowClassName?: string | ((arg: {index: number}) => string);
        rowStyle?: React.CSSProperties | ((arg: {index: number}) => React.CSSProperties);
        scrollToAlignment?: 'auto' | 'start' | 'end' | 'center';
        scrollToIndex?: number;
        scrollTop?: number;
        style?: React.CSSProperties;
        tabIndex?: number;
    }
    export class VirtualScroll extends React.Component<VirtualScrollProps, {}> {
        forceUpdateGrid(): void;
        measureAllRows(): void;
        recomputeRowHeights(index: number): void;
    }

    export interface GridProps extends React.Props<Grid> {
        cellRenderer: (arg: {
            columnIndex: number;
            isScrolling: boolean;
            rowIndex: number;
        }) => JSX.Element | undefined;
        columnCount: number;
        columnWidth: number | ((arg: {index: number}) => number);
        height: number;
        width: number;
        rowCount: number;
        rowHeight: number | ((arg: {index: number}) => number);
        autoHeight?: boolean;
        cellClassName?: string | ((args: {columnIndex: number; rowIndex: number}) => string);
        cellRangeRenderer?: (args: {
            cellCache: Map<any, any>;
            cellRenderer: Function;
            columnSizeAndPositionManager: any;
            columnStartIndex: number;
            columnStopIndex: number;
            isScrolling: boolean;
            rowSizeAndPositionManager: any;
            rowStartIndex: number;
            rowStopIndex: number;
            scrollLeft: number;
            scrollTop: number;
        }) => JSX.Element[] | undefined;
        cellStyle?: (args: {
            columnIndex: number;
            rowIndex: number;
        }) => React.CSSProperties;
        className?: string;
        estimatedColumnSize?: number;
        estimatedRowSize?: number;
        noContentRenderer?: () => JSX.Element;
        onSectionRendered?: (args: {
            columnOverscanStartIndex: number;
            columnOverscanStopIndex: number;
            columnStartIndex: number;
            columnStopIndex: number;
            rowOverscanStartIndex: number;
            rowOverscanStopIndex: number;
            rowStartIndex: number;
            rowStopIndex: number;
        }) => void;
        onScroll?: (args: { clientHeight: number;
            clientWidth: number;
            scrollHeight: number;
            scrollLeft: number;
            scrollTop: number;
            scrollWidth: number;
        }) => void;
        overscanColumnCount?: number;
        overscanRowCount?: number;
        scrollLeft?: number;
        scrollToAlignment?: string;
        scrollToColumn?: number;
        scrollToRow?: number;
        scrollTop?: number;
        style?: React.CSSProperties;
        tabIndex?: number;
    }
    export class Grid extends React.Component<GridProps, {}> {
        measureAllCells(): void;
        recomputeGridSize(indices: {columnIndex: number; rowIndex: number}): void;
    }
}
