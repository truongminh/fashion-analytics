const { Browser } = require('../lib');

async function Listing(url, push) {
    const page = await Browser.NewPage();
    console.log('listing', url);
    const sleep = (t = 1000) => new Promise((r) => setTimeout(r, t));
    // increase max delay on slow network
    const max_delay = 10000;
    async function scrollUntilNoMore(itemSelector) {
        // wait for the scroll area
        await page.waitForSelector(itemSelector);
        let lastItems = [];
        let unchanged = 0;
        const delay = 100;
        while (true) {
            const items = await page.$$(itemSelector);
            if (items.length > lastItems.length) {
                // get elements
                for (let i = lastItems.length; i < items.length; i++) {
                    const it = items[i];
                    const el = await it.$('a[href^="/product"]');
                    const attr = await el.getProperty('href');
                    const href = await attr.jsonValue();
                    push(href);
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
    await page.goto(url);
    const itemSelector = '#category-product.main-content-area .productListItem';
    await scrollUntilNoMore(itemSelector);
}

module.exports = Listing;
