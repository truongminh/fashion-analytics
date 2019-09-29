const Browser = require('../lib/browser');
const { Sleep } = require('../lib/flow');

async function* Listing(ctx, it) {
    const { tracking, brand, time_key } = ctx;
    const page = await Browser.NewPage();
    try {
        for await (const parent_url of it) {
            const track = tracking.start('crawler', { brand, time_key, url: parent_url, type: 'listing' });
            for await (const product_url of ListingOne(page, parent_url)) {
                yield { parent_url, product_url };
            }
            track.end();
        }
    } finally {
        await page._close();
    }
}

module.exports = Listing;

/**
 * @param {import('puppeteer').Page} page
 */
async function* ListingOne(page, start_url) {
    // increase max delay on slow network
    let url = start_url;
    while (true) {
        console.log('listing', url);
        await page.goto(url);
        // wait for the scroll area
        await page.waitForSelector('#products');
        const itemSelector = '#products .title_product a[href^="https://ivymoda.com/sanpham/';
        const items = await page.$$(itemSelector);
        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            const attr = await el.getProperty('href');
            const href = await attr.jsonValue();
            yield href;
        }
        const pagingSelector = '#phantrang a[href^="https://ivymoda.com/danh-muc"]';
        const pages = await page.$$(pagingSelector);
        let next_url = null;
        for (let i = 0; i < pages.length; i++) {
            const el = pages[i];
            const attr = await el.getProperty('textContent');
            const text = (await attr.jsonValue()).trim();
            if (text === '»') {
                next_url = await el.getProperty('href').then(a => a.jsonValue());
                break;
            };
        }
        if (!next_url) {
            break;
        }
        url = next_url;
    }
}

