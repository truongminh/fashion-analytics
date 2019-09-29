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
    const opts = await init();
    const dir = 'ivymoda';
    const worker = require(path.join(__dirname, dir));
    await worker(opts);
}

// rejected promise
process.on('unhandledRejection', e => console.log(e.stack || e));
main();
