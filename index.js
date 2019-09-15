const { Mgo } = require('./lib');

async function init() {
    const ctx = {};
    const DB_URL = 'mongodb://127.0.0.1:27017/raw_data';
    ctx.ctime = new Date();
    ctx.db = await Mgo.connect({ url: DB_URL });
    console.log('Connected correctly mongodb');
    return ctx;
}

async function main() {
    const ctx = await init();
    const ninomax = await require('./ninomax')(ctx);
}

main().catch(e => console.log(e.stack || e));
