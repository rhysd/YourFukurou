const fs = global.require('fs');
const path = global.require('path');

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

    loadScript(src_path, parent, class_name) {
        let deferred = Promise.defer();
        let script = document.createElement('script');
        script.setAttribute('src', 'file://' + src_path);
        if (class_name !== undefined) {
            script.className = class_name;
        }
        script.onload = () => {
            deferred.resolve();
        };
        parent.appendChild(script);
        return deferred.promise;
    }

    fetchRequire(path) {
        return new Promise(resolve => {
            const required = global.require(path);
            console.log(required);
            resolve(required);
        });
    }

    loadSink(sink, elem) {
        return this.fetchRequire(sink.path)
                   .then((required) => {
                       this.loaded_sinks.push(sink);
                       return sink;
                   });
    }

    loadAllSinks(elem) {
        return Promise.all(
            this.findAllSinks().map(s => this.loadSink(s, elem))
        ).then(loaded_sinks => {
            // TODO:
            // Consider the duplicate of loaded_sinks' names.
            // (Should do unique() by the name?)
            let ret = [];
            for (const loaded of loaded_sinks) {
                for (const sink of global.StreamApp.router.getSinks(loaded.name)) {
                    sink.path = loaded.path;
                    ret.push(sink);
                }
            }
            return ret;
        });
    }

    loadStyleSheets(elem, sink) {
        for (const style of sink.stylesheets || []) {
            const p = path.join(path.dirname(sink.path), style);
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.className = 'sink-' + sink.name;
            link.href = 'file://' + p;
            elem.appendChild(link);
            console.log('Loaded CSS: ' + p);
        }
    }

    loadPluginAssets(elem) {
        return loaded_sinks => {
            for (const sink of loaded_sinks) {
                this.loadStyleSheets(elem, sink);

                Promise.all(
                    (sink.scripts || []).map(script => this.loadScript(
                        path.join(path.dirname(sink.path), script),
                        elem
                    ))
                ).then(() => {
                    if ('initialize' in sink) {
                        sink.initialize();
                    }
                });
            }
            return loaded_sinks;
        };
    }
}
