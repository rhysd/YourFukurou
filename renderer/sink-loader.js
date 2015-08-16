const fs = remote.require('fs');
const path = remote.require('path');

export default class SinkLoader {
    constructor() {
        this.load_paths = remote.getGlobal('load_paths');
        this.loaded_sinks = [];
    }

    getDirectries(target_path) {
        return fs.readdirSync(target_path)
                 .filter(entry_name => fs.statSync(path.join(target_path, entry_name)).isDirectory());
    }

    findSinksIn(load_path) {
        let sinks = [];
        for (const d of this.getDirectries(load_path)) {
            const p = path.join(load_path, d, "sink.js");
            if (fs.existsSync(p)) {
                sinks.push({name: d, path: p});
            }
        }
        return sinks;
    }

    findAllSinks() {
        let sinks = [];
        for (const p of this.load_paths) {
            if (fs.existsSync(p)) {
                sinks.push.apply(sinks, this.findSinksIn(p));
            }
        }
        return sinks;
    }

    loadSink(sink, elem) {
        let deferred = Promise.defer();
        let script = document.createElement('script');
        script.setAttribute('src', 'file://' + sink.path);
        script.className = 'sink-' + sink.name;
        script.onload = function() {
            deferred.resolve(sink);
        };
        elem.appendChild(script);
        this.loaded_sinks.push(sink);
        return deferred.promise;
    }

    loadAllSinks(elem) {
        let promises = [];
        for (const s of this.findAllSinks()) {
            promises.push(this.loadSink(s, elem));
        }
        return Promise.all(promises);
    }
}
