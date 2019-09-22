const Browser = require('../lib/browser');
const DetailPage = Symbol('detail_page');

async function Details(ctx, url) {
    ctx[DetailPage] = ctx[DetailPage] || await Browser.NewPage();
    const page = ctx[DetailPage];
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

module.exports = Details;
