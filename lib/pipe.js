const { pipeline } = require('stream');
const through2 = require('through2');

function Through2Map(fn) {
    const ctor = through2.ctor(
        {
            objectMode: true
        },
        async function (data, encoding, callback) {
            try {
                const push = this.push.bind(this);
                const value = await fn(data, push);
                if (value) {
                    this.push(value);
                }
                callback();
            } catch (e) {
                callback(e);
            }
        }
    );
    return ctor;
}

function from(arr) {
    const stream = through2.obj();
    for (let v of arr) { stream.write(v) };
    stream.end();
    return stream;
}

function once(obj) {
    const trigger = through2.obj();
    trigger.write(obj);
    trigger.end();
    return trigger;
}

function Pipeline(...transformers) {
    const streams = transformers.map(fn => {
        if (Array.isArray(fn)) {
            return from(fn);
        }
        const ctor = Through2Map(fn);
        return new ctor();
    });
    const init = once({});
    return pipeline(init, ...streams);
}

module.exports = {
    Pipeline
}
