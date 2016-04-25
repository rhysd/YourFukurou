declare namespace DraftJS {
    interface KeyBindingUtil {
        isCtrlKeyCommand(e: __React.SyntheticEvent): boolean;
        isOptionKeyCommand(e: __React.SyntheticEvent): boolean;
        hasCommandModifier(e: __React.SyntheticEvent): boolean;
    }

    interface Decorator {
        strategy: (contentBlock: any, callback: (start: number, last: number) => void) => void;
        component: __React.ReactType;
    }

    export type BlockType =
        'unstyled' |
        'paragraph' |
        'header-one' |
        'header-two' |
        'header-three' |
        'header-four' |
        'header-five' |
        'header-six' |
        'unordered-list-item' |
        'ordered-list-item' |
        'blockquote' |
        'pullquote' |
        'code-block' |
        'atomic';

    type EditorChangeType =
        /**
         * The depth value of one or more ContentBlock objects is being changed.
         */
        'adjust-depth' |

        /**
         * An entity is being applied (or removed via null) to one or more characters.
         */
        'apply-entity' |

        /**
         * A single character is being backward-removed.
         */
        'backspace-character' |

        /**
         * The type value of one or more ContentBlock objects is being changed.
         */
        'change-block-type' |

        /**
         * An inline style is being applied or removed for one or more characters.
         */
        'change-inline-style' |

        /**
         * A single character is being forward-removed.
         */
        'delete-character' |

        /**
         * One or more characters is being inserted at a selection state.
         */
        'insert-characters' |

        /**
         * A "fragment" of content (i.e. a BlockMap is being inserted at a selection state.
         */
        'insert-fragment' |

        /**
         * A redo operation is being performed. Since redo behavior is handled by the Draft core, it is unlikely that you will need to use this explicitly.
         */
        'redo' |

        /**
         * Multiple characters or blocks are being removed.
         */
        'remove-range' |

        /**
         * A spellcheck or autocorrect change is being performed. This is used to inform the core editor whether to try to allow native undo behavior.
         */
        'spellcheck-change' |

        /**
         * A single ContentBlock is being split into two, for instance when the user presses return.
         */
        'split-block' |

        /**
         * An undo operation is being performed. Since undo behavior is handled by the Draft core, it is unlikely that you will need to use this explicitly.
         */
        'undo';

    export type EditorCommand =
        /**
         * Self-explanatory.
         */
        'undo' |
        'redo' |

        /**
         * Perform a forward deletion.
         */
        'delete' |

        /**
         * Perform a forward deletion to the next word boundary after the selection.
         */
        'delete-word' |

        /**
         * Perform a backward deletion.
         */
        'backspace' |

        /**
         * Perform a backward deletion to the previous word boundary before the
         * selection.
         */
        'backspace-word' |

        /**
         * Perform a backward deletion to the beginning of the current line.
         */
        'backspace-to-start-of-line' |

        /**
         * Toggle styles. Commands may be intepreted to modify inline text ranges
         * or block types.
         */
        'bold' |
        'italic' |
        'underline' |
        'code' |

        /**
         * Split a block in two.
         */
        'split-block' |

        /**
         * Self-explanatory.
         */
        'transpose-characters' |
        'move-selection-to-start-of-block' |
        'move-selection-to-end-of-block' |

        /**
         * Commands to support the "secondary" clipboard provided by certain
         * browsers and operating systems.
         */
        'secondary-cut' |
        'secondary-paste';


    export type InlineStyle = Immutable.OrderedSet<string>;

    interface CharacterMetadataConfig {
        style?: InlineStyle;
        entity?: string;
    }

    type EntityType = 'LINK' | 'TOKEN' | 'PHOTO';
    type EntityMutability = 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED';

    class EntityInstance {
        getType(): EntityType;
        getMutability(): EntityMutability;
        getData(): Object;
    }
    export interface EntityInstance extends Immutable.Map<string, any> {
    }

    interface Entity {
        create(
            type: EntityType,
            mutability: EntityMutability,
            data?: Object
        ): string;
        add(instance: EntityInstance): string;
        get(key: string): EntityInstance;
        mergeData(key: string, toMerge: Object): EntityInstance;
        replaceData(key: string, newData: Object): EntityInstance;
    }

    export interface InlineStyleRange {
        style: string;
        offset: number;
        length: number;
    }
    export interface EntityRange {
        key: number;
        offset: number;
        length: number;
    }
    export interface RawContentBlock {
        key: string;
        type: BlockType;
        text: string;
        depth: number;
        inlineStyleRanges: InlineStyleRange[];
        entityRanges: EntityRange[];
    }
    export interface RawContentState {
        blocks: RawContentBlock[];
        entityMap: {[key: string]: RawEntity};
    }
    export interface RawEntity {
        type: EntityType;
        mutability: EntityMutability;
        data: {[key: string]: any};
    }
    export interface FakeClientRect {
        left: number;
        width: number;
        right: number;
        top: number;
        bottom: number;
        height: number;
    }
}

declare module 'draft-js' {
    export const KeyBindingUtil: DraftJS.KeyBindingUtil;

    export const AtomicBlockUtils: {
        insertAtomicBlock(
            editorState: EditorState,
            entitiyKey: string,
            character: string
        ): void;
    };

    export class ContentBlock {
        key: string;
        text: string;
        type: DraftJS.BlockType;
        characterList: Immutable.List<string>;
        depth: number;

        getKey(): string;
        getType(): DraftJS.BlockType;
        getText(): string;
        getCharacterList(): Immutable.List<string>;
        getLength(): number;
        getDepth(): number;
        getInlineStyleAt(offset: number): DraftJS.InlineStyle;
        getEntityAt(offset: number): string;

        findStyleRanges(
            filterFn: (value: CharacterMetadata) => boolean,
            callback: (start: number, end: number) => void
        ): void;
        findEntityRanges(
            filterFn: (value: CharacterMetadata) => boolean,
            callback: (start: number, end: number) => void
        ): void;
    }
    export interface ContentBlock extends Immutable.Map<string, any> {
    }

    export class CharacterMetadata {
        static create(config?: DraftJS.CharacterMetadataConfig): CharacterMetadata;
        static applyStyle(record: CharacterMetadata, style: string): CharacterMetadata;
        static removeStyle(record: CharacterMetadata, style: string): CharacterMetadata;
        static applyEntity(record: CharacterMetadata, entityKey: string): CharacterMetadata;

        getStyle(): DraftJS.InlineStyle;
        hasStyle(style: string): boolean;
        getEntity(): string;
    }
    export interface CharacterMetadata extends Immutable.Map<string, any> {
    }

    export const Entity: DraftJS.Entity;

    export class SelectionState {
        anchorKey: string;
        anchorOffset: string;
        focusKey: string;
        focusOffset: string;
        isBackward: boolean;
        hasFocus: boolean;

        static createEmpty(blockKey: string): SelectionState;

        getStartKey(): string;
        getStartOffset(): number;
        getEndKey(): string;
        getEndOffset(): number;
        getAnchorKey(): string;
        getAnchorOffset(): number;
        getFocusKey(): string;
        getFocusOffset(): number;
        getIsBackward(): boolean;
        getHasFocus(): boolean;
        isCollapsed(): boolean;
        hasEdgeWithin(blockKey: string, start: number, end: number): boolean;
        serialize(): string;
    }
    export interface SelectionState extends Immutable.Map<string, any> {
    }

    export type BlockMap = Immutable.OrderedMap<string, ContentBlock>;
    export class ContentState {
        blockMap: BlockMap;
        selectionBefore: SelectionState;
        selectionAfter: SelectionState;

        static createFromText(text: string, delimiter?: string): ContentState;
        static createFromBlockArray(blocks: ContentBlock[]): ContentState;

        getBlockMap(): BlockMap;
        getSelectionBefore(): SelectionState;
        getSelectionAfter(): SelectionState;
        getBlockForKey(key: string): ContentBlock;
        getKeyBefore(key: string): string;
        getKeyAfter(key: string): string;
        getBlockBefore(key: string): ContentBlock;
        getBlockAfter(key: string): ContentBlock;
        getBlocksAsArray(): ContentBlock[];
        getFirstBlock(): ContentBlock;
        getLastBlock(): ContentBlock;
        getPlainText(delimiter?: string): string;
        hasText(): boolean;
    }
    export interface ContentState extends Immutable.Map<string, any> {
    }

    export interface DecoratorType {
        getDecorations(block: ContentBlock): Immutable.List<string>;
        getComponentForKey(key: string): Function;
        getPropsForKey(key: string): Object;
    }
    export class CompositeDecorator implements DecoratorType {
        constructor(ds: DraftJS.Decorator[]);
        getDecorations(block: ContentBlock): Immutable.List<string>;
        getComponentForKey(key: string): Function;
        getPropsForKey(key: string): Object;
    }

    export interface EditorStateCreationConfig {
        allowUndo: boolean;
        currentContent: ContentState;
        decorator: DecoratorType;
        selection: SelectionState;
    }

    export class EditorState {
        allowUndo: boolean;
        currentContent: ContentState;
        decorator: DecoratorType;
        directionMap: BlockMap;
        forceSelection: boolean;
        inCompositionMode: boolean;
        inlineStyleOverride: DraftJS.InlineStyle;
        lastChangeType: DraftJS.EditorChangeType;
        nativelyRenderedContent: ContentState;
        redoStack: Immutable.Stack<ContentState>;
        selection: SelectionState;
        treeMap: Immutable.OrderedMap<string, Immutable.List<ContentBlock>>;
        undoStack: Immutable.Stack<ContentState>;

        static createEmpty(decorator?: DecoratorType): EditorState;
        static createWithContent(contentState: ContentState, decorator?: DecoratorType): EditorState;
        static create(config: EditorStateCreationConfig): EditorState;
        static push(
            editorState: EditorState,
            contentState: ContentState,
            changeType: DraftJS.EditorChangeType
        ): EditorState;
        static undo(editorState: EditorState): EditorState;
        static redo(editorState: EditorState): EditorState;
        static acceptSelection(
            editorState: EditorState,
            selectionState: SelectionState
        ): EditorState;
        static forceSelection(
            editorState: EditorState,
            selectionState: SelectionState
        ): EditorState;
        static moveSelectionToEnd(editorState: EditorState): EditorState;
        static moveFocusToEnd(editorState: EditorState): EditorState;
        static setInlineStyleOverride(inlineStyleOverride: DraftJS.InlineStyle): EditorState;

        getAllowUndo(): boolean;
        getCurrentContent(): ContentState;
        getDecorator(): DecoratorType;
        getDirectionMap(): BlockMap;
        getForceSelection(): boolean;
        getInCompositionMode(): boolean;
        getInlineStyleOverride(): DraftJS.InlineStyle;
        getLastChangeType(): DraftJS.EditorChangeType;
        getNativelyRenderedContent(): ContentState;
        getRedoStack(): Immutable.Stack<ContentState>;
        getSelection(): SelectionState;
        getTreeMap(): Immutable.OrderedMap<string, Immutable.List<ContentBlock>>;
        getUndoStack(): Immutable.Stack<ContentState>;

        /**
         * Returns the current contents of the editor.
         */
        getCurrentContent(): ContentState;

        /**
         * Returns the current cursor/selection state of the editor.
         */
        getSelection(): SelectionState;

        /**
         * Returns an OrderedSet<string> that represents the "current" inline style for the editor.
         * This is the inline style value that would be used if a character were inserted for the current ContentState and SelectionState, and takes into account any inline style overrides that should be applied.
         */
        getCurrentInlineStyle(): DraftJS.InlineStyle;

        /**
         * Returns an Immutable List of decorated and styled ranges. This is used for rendering purposes, and is generated based on the currentContent and decorator.
         *
         * At render time, this object is used to break the contents into the appropriate block, decorator, and styled range components.
         */
        getBlockTree(blockKey: string): Immutable.List<ContentBlock>;
    }
    export interface EditorState extends Immutable.Map<string, any> {
    }

    export const RichUtils: {
        currentBlockContainsLink(editorState: EditorState): boolean;
        getCurrentBlockType(editorState: EditorState): string;
        handleKeyCommand(editorState: EditorState, command: string): boolean;
        insertSoftNewline(editorState: EditorState): EditorState;
        onBackspace(editorState: EditorState): EditorState;
        onDelete(editorState: EditorState): EditorState;
        onTab(event: __React.SyntheticEvent, editorState: EditorState, maxDepth: number): EditorState;
        toggleBlockType(editorState: EditorState, blockType: string): EditorState;
        toggleCode(editorState: EditorState): EditorState;
        toggleInlineStyle(editorState: EditorState, inlineStyle: string): EditorState;
        toggleLink(editorState: EditorState, targetSelection: SelectionState, entityKey: string): EditorState;
        tryToRemoveBlockStyle(editorState: EditorState): EditorState;
    };

    export interface EditorProps extends __React.Props<Editor> {
        /**
         * The two most critical props are `editorState` and `onChange`.
         *
         * The `editorState` prop defines the entire state of the editor, while the
         * `onChange` prop is the method in which all state changes are propagated
         * upward to higher-level components.
         *
         * These props are analagous to `value` and `onChange` in controlled React
         * text inputs.
         */
        editorState: EditorState;
        onChange: (editorState: EditorState) => void;

        placeholder?: string;

        // Specify whether text alignment should be forced in a direction
        // regardless of input characters.
        textAlignment?: 'left' | 'center' | 'right';

        // For a given `ContentBlock` object, return an object that specifies
        // a custom block component and/or props. If no object is returned;
        // the default `TextEditorBlock` is used.
        blockRendererFn?: (block: ContentBlock) => Object;

        // Function that returns a cx map corresponding to block-level styles.
        blockStyleFn?: (type: number) => string;

        // A function that accepts a synthetic key event and returns
        // the matching DraftEditorCommand constant, or null if no command should
        // be invoked.
        keyBindingFn?: (e: __React.KeyboardEvent) => string;

        // Set whether the `DraftEditor` component should be editable. Useful for
        // temporarily disabling edit behavior or allowing `DraftEditor` rendering
        // to be used for consumption purposes.
        readOnly?: boolean;

        // Note: spellcheck is always disabled for IE. If enabled in Safari, OSX
        // autocorrect is enabled as well.
        spellCheck?: boolean;

        // Set whether to remove all style information from pasted content. If your
        // use case should not have any block or inline styles, it is recommended
        // that you set this to `true`.
        stripPastedStyles?: boolean;

        tabIndex?: number;

        ariaActiveDescendantID?: string;
        ariaAutoComplete?: string;
        ariaDescribedBy?: string;
        ariaExpanded?: boolean;
        ariaHasPopup?: boolean;
        ariaLabel?: string;
        ariaOwneeID?: string;

        webDriverTestID?: string;

        /**
         * Cancelable event handlers, handled from the top level down. A handler
         * that returns true will be the last handler to execute for that event.
         */

        // Useful for managing special behavior for pressing the `Return` key. E.g.
        // removing the style from an empty list item.
        handleReturn?: (e: __React.KeyboardEvent) => boolean;

        // Map a key command string provided by your key binding function to a
        // specified behavior.
        handleKeyCommand?: (command: DraftJS.EditorCommand) => boolean;

        // Handle intended text insertion before the insertion occurs. This may be
        // useful in cases where the user has entered characters that you would like
        // to trigger some special behavior. E.g. immediately converting `:)` to an
        // emoji Unicode character, or replacing ASCII quote characters with smart
        // quotes.
        handleBeforeInput?: (chars: string) => boolean;

        handlePastedText?: (text: string, html?: string) => boolean;

        handlePastedFiles?: (files: Blob[]) => boolean;

        // Handle dropped files
        handleDroppedFiles?: (
            selection: SelectionState,
            files: Blob[]
        ) => boolean;

        // Handle other drops to prevent default text movement/insertion behaviour
        handleDrop?: (
            selection: SelectionState,
            dataTransfer: Object,
            isInternal: 'internal' | 'external'
        ) => boolean;

        /**
         * Non-cancelable event triggers.
         */
        onEscape?: (e: __React.KeyboardEvent) => void;
        onTab?: (e: __React.KeyboardEvent) => void;
        onUpArrow?: (e: __React.KeyboardEvent) => void;
        onDownArrow?: (e: __React.KeyboardEvent) => void;

        onBlur?: (e: __React.SyntheticEvent) => void;
        onFocus?: (e: __React.SyntheticEvent) => void;

        /**
         * Provide a map of inline style names corresponding to CSS style objects
         * that will be rendered for matching ranges.
         */
        customStyleMap?: Object;
    }
    export class Editor extends __React.Component<EditorProps, {}> {
        focus(): void;
        blur(): void;
    }

    export const Modifier: {
        replaceText(
            contentState: ContentState,
            rangeToReplace: SelectionState,
            text: string,
            inlineStyle?: DraftJS.InlineStyle,
            entityKey?: string
        ): ContentState;

        insertText(
            contentState: ContentState,
            targetRange: SelectionState,
            text: string,
            inlineStyle?: DraftJS.InlineStyle,
            entityKey?: string
        ): ContentState;

        moveText(
            contentState: ContentState,
            removalRange: SelectionState,
            targetRange: SelectionState
        ): ContentState;

        replaceWithFragment(
            contentState: ContentState,
            targetRange: SelectionState,
            fragment: BlockMap
        ): ContentState;

        removeRange(
            contentState: ContentState,
            rangeToRemove: SelectionState,
            removalDirection: 'backward' | 'forward'
        ): ContentState;

        splitBlock(
            contentState: ContentState,
            selectionState: SelectionState
        ): ContentState;

        applyInlineStyle(
            contentState: ContentState,
            selectionState: SelectionState,
            inlineStyle: string
        ): ContentState;

        removeInlineStyle(
            contentState: ContentState,
            selectionState: SelectionState,
            inlineStyle: string
        ): ContentState;

        setBlockType(
            contentState: ContentState,
            selectionState: SelectionState,
            blockType: DraftJS.BlockType
        ): ContentState;

        applyEntity(
            contentState: ContentState,
            selectionState: SelectionState,
            entityKey: string
        ): ContentState;
    };

    export function getDefaultKeyBinding(e: __React.SyntheticEvent): string;
    export function genKey(): string;
    export function getVisibleSelectionRect(): void;

    export function convertFromRaw(rawState: DraftJS.RawContentState): ContentBlock[];
    export function convertToRaw(contentState: ContentState): DraftJS.RawContentState;
    export function convertFromHTML(html: string): ContentBlock[];
}
