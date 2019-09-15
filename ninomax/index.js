

module.exports= async function (ctx) {
    const urls = require('./init');
    const listing = require('./listing');
    const details = require('./details');
    const save = require('./save');
    const collection = 'ninomax';
    for (let url of urls) {
        const it = listing(ctx, url);
        for await (const link of it) {
            const row = await details(ctx, link);
            await save(ctx, { collection, row });
        }
    }
}
