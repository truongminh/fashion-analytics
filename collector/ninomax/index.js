
const { format } = require('date-fns');
const Today = () => format(new Date(), 'yyyy-MM-dd');
function PriceToNumber(price) {
    const n = price.split('').filter(v => !isNaN(v)).join('');
    return +n;
}

module.exports = async function (opts) {
    const urls = require('./init');
    const listing = require('./listing');
    const details = require('./details');
    const brand = 'ninomax';
    const saver = opts.saver;
    async function Run(ctx) {
        const it = listing(ctx, urls);
        for await (const v of it) {
            try {
                const { detail_url: product_url, parent_url } = v;
                const time_key = Today();
                const existed = await saver.existed(ctx, { brand, time_key, product_url });
                if (existed) {
                    console.log(`[WARNING] encounter existing product ${product_url} in ${parent_url}`);
                    continue;
                }
                const stime = new Date();
                const row = await details(ctx, product_url);
                const ctime = new Date();
                const price = PriceToNumber(row.product_price);
                const currency = 'dong';
                const params = {
                    ...row,
                    brand, time_key, product_url, parent_url,
                    price, currency, stime, ctime,
                };
                await saver.upsert(ctx, params);
                console.log('saved', params);
            } catch (e) {
                console.log(e.stack || e);
            }
        }
    }
    return {
        Run
    };
}
