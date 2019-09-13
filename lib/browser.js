
const puppeteer = require('puppeteer');

const NewPage = async () => {
    const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3239.108 Safari/537.36';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    return page;
}

module.exports = {
    NewPage
};
