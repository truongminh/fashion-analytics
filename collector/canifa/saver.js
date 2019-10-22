
async function* Saver(ctx, it) {
    const { brand, time_key, saver } = ctx;
    for await (const product of it) {
        try {
            await saver.upsert({ brand, time_key, product });
            console.log('saved', product);
        } catch (e) {
            console.log(e.stack || e);
        }
    }
}

module.exports = Saver;
