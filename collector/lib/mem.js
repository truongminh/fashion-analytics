
async function SaverFactory(opts) {
    const arr = [];
    const get = async (ctx, brand, time_key, product_url) => {
        return arr.find(a => {
            return a.time_key === time_key && a.product_url == product_url;
        });
    }
    const upsert = async (ctx, brand, time_key, product_url, row) => {
        const current = await get(ctx, time_key, product_url);
        const data = { ...row, time_key, product_url };
        if (current) {
            Object.assign(curremt, data);
        } else {
            arr.push(data);
        }
    };
    return {
        name: 'console',
        collection,
        existed: get,
        upsert
    }
}


module.exports = {
    SaverFactory
}
