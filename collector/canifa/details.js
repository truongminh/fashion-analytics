const Browser = require('../lib/browser');

function PriceToNumber(price) {
    const n = price.split('').filter(v => !isNaN(v)).join('');
    return +n;
}

function StripPrefix(s, prefix) {
    if (s.startsWith(prefix)) {
        return s.substring(prefix.length);
    }
    return s;
}

async function* Details({ saver, brand, time_key, tracking }, it) {
    const page = await Browser.NewPage();

    for await (let v of it) {
        try {
            const { parent_url, product_url } = v;
            const existed = await saver.existed({ brand, time_key, product_url });
            if (existed) {
                console.log(`[WARNING] encounter existing product ${product_url} in ${parent_url}`);
                continue;
            }
            const track = tracking.start('crawler', { brand, time_key, url: product_url, type: 'details' });
            const data = await DetailOne(page, product_url);
            track.end();
            data.product_number = StripPrefix(data.product_number, 'Mã: ');
            data.product_url = product_url;
            data.parent_url = parent_url;
            data.price = PriceToNumber(data.product_price);
            data.currency = 'dong';
            yield data;
        } catch (e) {
            console.log(e.stack || e);
        }
    }
    await page._close();
}

module.exports = Details;

async function DetailOne(page, url) {
    async function getTextContent(selector, parent = page) {
        const el = await parent.$(selector);
        if (!el) {
            // console.log('[WARNING] encounter empty property', selector);
            return '';
        }
        const attr = await el.getProperty('textContent');
        const text = (await attr.jsonValue()).trim();
        return text;
    }
    async function getProperty(selector, prop, parent = page) {
        const els = await parent.$$(selector);
        const values = await Promise.all(
            els.map(el => el.getProperty(prop).then(attr => attr.jsonValue()))
        );
        return values;
    }
    console.log('crawling', url);
    await page.goto(url);
    await page.waitFor('#product_addtocart_form');
    const parent = await page.$('#product_addtocart_form .product-shop-content');
    const product_name = await getTextContent('.product-name .h1', parent);
    const product_number = await getTextContent('.product-detail-code', parent);
    // const old_product_price = await getTextContent('.old-price .price', parent);
    const regular_price = await getTextContent('.regular-price .price', parent);
    const special_product_price = await getTextContent('.special-price .price', parent);
    const product_price = regular_price || special_product_price;
    if (!product_price) {
        console.log('[WARNING] encounter empty price', url);
    }
    const product_description = await getTextContent('#product-detail-tabs');
    const images = await getProperty('#product-image-gallery img', 'src');
    const data = {
        product_number, product_name,
        product_price,
        product_description,
        images,
    };
    return data;
}

