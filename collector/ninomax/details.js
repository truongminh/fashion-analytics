const Browser = require('../lib/browser');

function PriceToNumber(price) {
    const n = price.split('').filter(v => !isNaN(v)).join('');
    return +n;
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
            const track = tracking.start('crawler', { brand, time_key, product_url });
            const data = await DetailOne(page, product_url);
            track.end();
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
    async function getTextContent(selector) {
        const el = await page.$(selector);
        if (!el) {
            console.log('[WARNING] encounter empty property', selector);
            return '';
        }
        const attr = await el.getProperty('textContent');
        const text = (await attr.jsonValue()).trim();
        return text;
    }
    async function getProperty(selector, prop) {
        const els = await page.$$(selector);
        const values = await Promise.all(
            els.map(el => el.getProperty(prop).then(attr => attr.jsonValue()))
        );
        return values;
    }
    console.log('crawling', url);
    await page.goto(url);
    await page.waitFor('.referenciaProducto');
    const product_number = await getTextContent('.referenciaProducto ');
    const product_name = await getTextContent('.info_cabecera_producto h1')
    const product_price = await getTextContent('.precioProducto ');
    const product_description = await getTextContent('.precio_cabecera_producto .ficha_warning p');
    const images = await getProperty('#gallery-product a img', 'src')
    const data = {
        product_number, product_name,
        product_price,
        product_description,
        images,
    };
    return data;
}

