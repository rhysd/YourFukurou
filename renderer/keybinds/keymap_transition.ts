import GlobalKeyMaps from './global';
import EditorKeyMaps from './editor';
import MediaPreviewKeyMaps from './media_preview';
import SlaveTimelineKeyMaps from './slave_timeline';
import State from '../states/root';
import log from '../log';

type AnyKeymaps = GlobalKeyMaps | EditorKeyMaps | MediaPreviewKeyMaps | SlaveTimelineKeyMaps;

export class KeymapTransition {
    current: AnyKeymaps;
    global: GlobalKeyMaps;
    editor: EditorKeyMaps;
    media_preview: MediaPreviewKeyMaps;
    slave_timeline: SlaveTimelineKeyMaps;

    constructor() {
        this.global = new GlobalKeyMaps(window);
        this.editor = new EditorKeyMaps();
        this.media_preview = new MediaPreviewKeyMaps();
        this.slave_timeline = new SlaveTimelineKeyMaps();
        this.current = this.global;
    }

    escapeFromCurrentKeymaps(state: State) {
        const current = this.current;
        if (current instanceof EditorKeyMaps) {
            this.escapeFromEditor(state);
        } else if (current instanceof MediaPreviewKeyMaps) {
            this.escapeFromMediaPreview(state);
        } else if (current instanceof SlaveTimelineKeyMaps) {
            this.escapeFromSlaveTimeline(state);
        } else if (current instanceof GlobalKeyMaps) {
            log.error('Try to escape from global keymaps.  State broken?');
        } else {
            log.error('Current keymaps is broken:', current);
        }
    }

    enterEditor() {
        this.doTransition(this.editor);
    }

    enterMediaPreview() {
        if (this.current instanceof EditorKeyMaps) {
            log.debug('Already editor is open. Skip transition to media preview keymaps');
        } else {
            this.doTransition(this.media_preview);
        }
    }

    enterSlaveTimeline() {
        if (this.current instanceof EditorKeyMaps) {
            log.debug('Already editor is open. Skip transition to slave timeline keymaps');
        } else if (this.current instanceof MediaPreviewKeyMaps) {
            log.error('Trying to invalid transition: media preview -> slave timeline');
        } else {
            this.doTransition(this.slave_timeline);
        }
    }

    disableAll() {
        this.global.disable();
        this.editor.disable();
        this.media_preview.disable();
        this.slave_timeline.disable();
    }

    private doTransition(to: AnyKeymaps) {
        const prev = this.current;
        prev.disable();
        to.enable(window);
        this.current = to;
        log.debug(`Keymap state changed: Escape: ${prev.constructor.name} -> ${this.current.constructor.name}`);
    }

    private escapeFromEditor(state: State) {
        const next =
            state.tweetMedia.is_open ? this.media_preview :
            state.slaveTimeline !== null ? this.slave_timeline :
            this.global;
        this.doTransition(next);
    }

    private escapeFromMediaPreview(state: State) {
        const next =
            state.editor.is_open ? this.editor :
            state.slaveTimeline !== null ? this.slave_timeline :
            this.global;
        this.doTransition(next);
    }

    private escapeFromSlaveTimeline(state: State) {
        const next =
            state.editor.is_open ? this.editor :
            state.tweetMedia.is_open ? this.media_preview :
            this.global;
        this.doTransition(next);
    }

}

export default new KeymapTransition();
