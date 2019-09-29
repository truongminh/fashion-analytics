const path = require('path');
const Mgo = require('./lib/mgo');
const Mem = require('./lib/mem');

async function init() {
    const { RAW_DB_URL, TRACKING_DB_URL } = require('./config');
    require('events').EventEmitter.defaultMaxListeners = 1023;
    const opts = {};
    opts.ctime = new Date();
    // opts.saver = await Mem.SaverFactory();
    opts.saver = await Mgo.SaverFactory({ DB_URL: RAW_DB_URL });
    opts.tracking = await Mgo.TrackingFactory({ DB_URL: TRACKING_DB_URL });
    console.log('saver factory', opts.saver.name);
    return opts;
}

async function main() {
    const dir = process.argv[2];
    if (!dir) {
        console.log('USAGE: node index.js [ninomax|ivymoda]');
        process.exit(0);
    }
    const worker = require(path.join(__dirname, dir));
    const opts = await init();
    await worker(opts);
}

// rejected promise
process.on('unhandledRejection', e => console.log(e.stack || e));
main();
