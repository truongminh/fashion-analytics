const { Browser } = require('../lib');

async function Details(ctx, url) {
    const page = await Browser.NewPage();
    async function getTextContent(selector) {
        const el = await page.$(selector);
        const attr = await el.getProperty('textContent');
        const text = (await attr.jsonValue()).trim();
        return text;
    }
    console.log('crawling', url);
    await page.goto(url);
    const product_id = await getTextContent('.referenciaProducto ');
    const product_name = await getTextContent('.info_cabecera_producto h1')
    const product_price = await getTextContent('.precioProducto ');
    const product_description = await getTextContent('.precio_cabecera_producto .ficha_warning p');
    const data = {
        url,
        product_name, product_id, product_price, product_description
    };
    return data;
}

module.exports = Details;
