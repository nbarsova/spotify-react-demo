export class ScriptCache {

    constructor(scripts, onSuccess) {
        this.loaded = [];
        this.failed = [];
        this.pending = [];
        this.callbacks = {};
        this.onSuccess = onSuccess;
        this.load(scripts)
    }

    load(scripts) {
        for (const script of scripts) {
            this.loadSrc(script.name);
            if (typeof script.callback !== "undefined") {
                this.callbacks[script.name] = script.callback;
            }
        }
    }

    loadSrc(src) {
        if (this.loaded.indexOf(src) >= 0) {
            return Promise.resolve(src);
        }

        this.pending.push(src);

        return this.scriptTag(src)
            .then(() => {
                if (this.callbacks.hasOwnProperty(src)) {
                    console.log(this);
                    this.callbacks[src](); // run a callback for this script if it exists
                }
                if (this.pending.length === 0 && this.onSuccess) {
                    this.onSuccess();
                }
            })
            .catch(() => {
                console.log("Loading " + src + " rejected");
            })
    }


    scriptTag(src, cb) {
        return new Promise((resolve, reject) => {
            let resolved = false;
            let errored = false;
            let body = document.getElementsByTagName('body')[0];
            let tag = document.createElement('script');

            tag.type = 'text/javascript';
            tag.async = false; // Load in order

            tag.onreadystatechange = function () {
                if (resolved) {
                    return handleLoad();
                }
                if (errored) {
                    return handleReject();
                }
                const state = tag.readyState;
                if (state === 'complete') {
                    handleLoad()
                } else if (state === 'error') {
                    handleReject()
                }
            };

            const handleLoad = (evt) => {
                resolved = true;
                this.pending.splice(this.pending.indexOf(src), 1);
                this.loaded.push(src);
                resolve(src);
            };
            const handleReject = (evt) => {
                errored = true;
                this.pending.splice(this.pending.indexOf(src), 1);
                this.failed.push(src);
                reject(src)
            };

            tag.addEventListener('load', handleLoad);
            tag.addEventListener('error', handleReject);

            tag.src = src;
            body.appendChild(tag);
            return tag;
        });
    }
}