const { Browser } = require('../lib');

async function* Listing(ctx, url) {
    const page = await Browser.NewPage();
    const sleep = (t = 1000) => new Promise((r) => setTimeout(r, t));
    // increase max delay on slow network
    const max_delay = 10000;
    const delay = 100;
    const itemSelector = '#category-product.main-content-area .productListItem';
    console.log('listing', url);
    await page.goto(url);
    // wait for the scroll area
    await page.waitForSelector(itemSelector);
    let lastItems = [];
    let unchanged = 0;
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
        await sleep(delay);
    }
}

module.exports = Listing;
