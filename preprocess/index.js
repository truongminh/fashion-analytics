const fs = require('fs')
const assert = require('assert')
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

async function loadUrlTagsMap(brand){
    try{
        const path = "../meta_data/url_"+brand+".json"
        let content = fs.readFileSync(path)
        let data = JSON.parse(content)
        assert.equal(brand, data.brand)
        let map = {}
        for (grp of data.groups){
            for (url of grp.urls){
                map[url.url] = {category : url.category, group : grp.group}
            }
        }
        return map
    } catch (err) {
        console.log(err)
        return {}
    }
}

async function loadData(opts) {
    ctx = {}
    brand = 'ninomax'
    
    const urlTagsMap = await loadUrlTagsMap(brand);

    docCursor = await opts.rawdb.list(ctx, brand)
    while (await docCursor.hasNext()){
        product = await docCursor.next()
        ret = await opts.db.upsertProduct({brand, ...product})
        tags = urlTagsMap[product.parent_url]
        if (!tags){
            console.log(product.parent_url + " is not tagged yet")
        }
    }

    //map url to category
}

async function main() {
    const opts = await init();
    //console.log(opts)
    await loadData(opts)
}

main().catch(e => console.log(e.stack || e));
