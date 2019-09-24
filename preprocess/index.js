const {RawDBFactory, DBFactory} = require('./lib/mgo');

async function init() {
    const {DB_URL, RAW_DB_URL} = require('./config');
    require('events').EventEmitter.defaultMaxListeners = 1023;
    const opts = {};
    opts.ctime = new Date();
    opts.rawdb = await RawDBFactory({RAW_DB_URL });
    opts.db = await DBFactory({DB_URL})
    console.log('created db factory', opts.rawdb.name);
    console.log('created db factory', opts.db.name)
    return opts;
}

async function loadData(opts) {
    ctx = {}
    brand = 'ninomax'
    docCursor = await opts.rawdb.list(ctx, brand)
    while (await docCursor.hasNext()){
        product = await docCursor.next()
        //console.log(cur)   
        ret = await opts.db.upsertProduct({brand, ...product})
    }
}

async function main() {
    const opts = await init();
    //console.log(opts)
    await loadData(opts)
}

main().catch(e => console.log(e.stack || e));
