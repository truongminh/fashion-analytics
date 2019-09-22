const { SaverFactory } = require('./lib/mgo');

async function init() {
    const { DB_URL } = require('./config');
    require('events').EventEmitter.defaultMaxListeners = 1023;
    const opts = {};
    opts.ctime = new Date();
    opts.saver = await SaverFactory({ DB_URL });
    console.log('saver factory', opts.saver.name);
    return opts;
}

async function main() {
    const opts = await init();
    const ninomax = await require('./ninomax')(opts);
    const ctx = {};
    await ninomax.Run(ctx);
}

main().catch(e => console.log(e.stack || e));
