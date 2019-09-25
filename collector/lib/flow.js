const Sleep = (t = 1000) => new Promise((r) => setTimeout(r, t));

const POLL_WAIT = 500;

async function *From(arr) {
    for(const v of arr) {
        yield v;
    }
}

async function Sequence(ctx, seed, stages) {
    let it = From(seed);
    for (const s of stages) {
        const stage = s instanceof Stage ? s : new Stage(s);
        it = stage.Run(ctx, it);
    }
    for await (let v of it) {
    }
}

class Stage {
    constructor(fn, opts = {}) {
        this.fn = fn;
        this.opts = opts;
    }

    // fetch sources without waiting for next
    async *Run(ctx, input) {
        let data = [];
        const end = Symbol('end');
        const { parallel = 1, logger } = this.opts;
        const runner = async (i) => {
            const it = this.fn(ctx, input);
            for await (let v of it) {
                if (logger) {
                    logger('>> ', this.fn.name, i, 'push', v);
                }
                data.push(v);
            }
            data.push(end);
        };
        for (let i = 0; i < parallel; i++) {
            runner(i);
        }
        while (1) {
            while (data.length) {
                const d = data.shift();
                if (d === end) {
                    return;
                }
                yield d;
            }
            await Sleep(POLL_WAIT);
        }
    }
}

function Parallel(fn, parallel) {
    return new Stage(fn, { parallel })
}

module.exports = {
    Sleep, Sequence, Parallel,
}
