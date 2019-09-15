
async function* New(ctx) {
    const urls = require('./init');
    const listing = require('./listing');
    const details = require('./details');
    for (let url of urls) {
        const it = listing(ctx, url);
        for await (const link of it) {
            const data = await details(ctx, link);
            yield data;
        }
    }
}

module.exports = New;
