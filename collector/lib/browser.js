const puppeteer = require('puppeteer');

const NewPage = async () => {
    const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3239.108 Safari/537.36';
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setRequestInterception(true);
    const abort_types = ['image', 'font'];
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (abort_types.indexOf(resourceType) !== -1) {
            req.abort();
            return;
        }
        const url = req.url();
        if (
            url.includes('facebook.com') ||
            url.includes('facebook.net') ||
            url.includes('gstatic.com') ||
            url.includes('googletagmanager.com') ||
            url.includes('addthis.com') ||
            url.includes('mngbcn.com') ||
            url.includes('addthisedge.com')) {
            req.abort();
            return;
        }
        if (['script', 'stylesheet'].indexOf(resourceType) === -1) {
            console.log('> ', resourceType, url);
        }
        req.continue();
    });
    page._close = async () => {
        await page.close();
        await browser.close();
    }
    return page;
}

module.exports = {
    NewPage
};
