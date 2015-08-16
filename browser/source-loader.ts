import Source from "./source";
import {join} from "path";
import {existsSync} from "fs";

export default class SourceLoader {
    constructor(public load_paths: string[], private window: GitHubElectron.BrowserWindow) {}

    load(name: string): Source {
        for (const load_path of this.load_paths) {
            const stream_path = join(load_path, name, "source.js");
            if (existsSync(stream_path)) {
                return new Source(this.window, name, require(stream_path));
            }
        }
        return null;
    }
}
