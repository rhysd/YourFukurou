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

    loadStyleSheets(elem, stylesheets, loaded) {
        for (const style of stylesheets) {
            const p = path.join(path.dirname(loaded.path), style);
            let link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.className = 'sink-' + loaded.name;
            link.href = 'file://' + p;
            elem.appendChild(link);
            console.log('Loaded CSS: ' + p);
        }
    }

    loadScripts(elem, scripts, loaded) {
        for (const s of scripts) {
            const p = path.join(path.dirname(loaded.path), s);
            let script = document.createElement('script');
            script.setAttribute('src', 'file://' + p);
            script.className = 'sink-' + loaded.name;
            elem.appendChild(script);
            console.log('Loaded Script: ' + p);
        }
    }

    loadAllPluginCSS(elem) {
        for (const l of this.loaded_sinks) {
            for (const sink of global.StreamApp.getSinks(l.name)) {
                if ('stylesheets' in sink) {
                    this.loadStyleSheets(elem, sink.stylesheets, l);
                }
                if ('scripts' in sink) {
                    this.loadScripts(elem, sink.scripts, l);
                }
            }
        }
    }
}
