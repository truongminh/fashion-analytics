const Browser = require('../lib/browser');
const { Sleep } = require('../lib/flow');

async function* Listing(ctx, it) {
    const { tracking, brand, time_key } = ctx;
    const page = await Browser.NewPage();
    try {
        for await (const parent_url of it) {
            const track = tracking.start('crawler', { brand, time_key, url: parent_url });
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

async function* ListingOne(page, url) {
    // increase max delay on slow network
    const max_delay = 30000;
    const delay = 100;
    const itemSelector = '#category-product.main-content-area .productListItem';
    console.log('listing', url);
    await page.goto(url);
    // wait for the scroll area
    await page.waitForSelector(itemSelector);
    let lastItems = [];
    let unchanged = 0;
    // http://www.ninomaxx.com.vn/category-product/filter
    while (true) {
        const items = await page.$$(itemSelector);
        if (items.length > lastItems.length) {
            // get elements
            for (let i = lastItems.length; i < items.length; i++) {
                const it = items[i];
                const el = await it.$('a[href^="/product"]');
                const attr = await el.getProperty('href');
                const href = await attr.jsonValue();
                yield href;
            }
            lastItems = items;
            unchanged = 0;
            // console.log('scrolling ...');
        } else {
            unchanged++;
            if (max_delay / delay < unchanged) {
                console.log('no changes after', max_delay);
                break;
            }
        }
        // scroll
        await page.evaluate(selector => {
            const elements = document.querySelectorAll(selector);
            elements[elements.length - 1].scrollIntoView({
                behavior: 'smooth', block: 'end', inline: 'end'
            });
        }, `${itemSelector}`);
        await Sleep(delay);
    }
}

