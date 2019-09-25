const Sleep = (t = 1000) => new Promise((r) => setTimeout(r, t));

const POLL_WAIT = 500;
// fetch sources without waiting for next
async function* wrapper(it) {
    let done = false;
    let data = [];
    const runner = async () => {
        for await (let v of it) {
            data.push(v);
        }
        done = true;
    };
    runner();
    while (!done) {
        while (data.length) {
            yield data.pop();
        }
        await Sleep(POLL_WAIT);
    }
}

async function Sequence(ctx, seed, stages) {
    let it = seed;
    for (const fn of stages) {
        it = wrapper(fn(ctx, it));
    }
    let res = [];
    for await (let v of it) {
        res.push(v);
    }
    return res;
}

module.exports = {
    Sleep, Sequence
}
