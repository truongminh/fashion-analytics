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

async function loadData(opts) {
    ctx = {}
    brand = 'ninomax'
    
    docCursor = await opts.rawdb.list(ctx, brand)
    while (await docCursor.hasNext()){
        product = await docCursor.next()
        
        //find the corresponding category tags from the listing url
        urldoc = await opts.db.findTags(product.parent_url)
        if (urldoc){
            //console.log(urldoc)
            //set tags and groups to product
            //product.tagids = urldoc.tagids
            //product.group = urldoc.group
            let data = {
                desc : product.product_description,
                name : product.product_name,
                number : product.product_number,
                par_url : product.parent_url,
                currency : product.currency,
                last_crawle_date : product.time_key,
                last_price : product.product_price,
                cattagids : urldoc.cattagids,
                group : urldoc.group
            }
    
            const query = {brand: brand, url : product.product_url};

            ret = await opts.db.upsertProduct(query, data)
        }else{
            console.log("something unexpected: " + product.parent_url + " is not tagged yet")
        }
    }
}

async function main() {
    const opts = await init();
    //console.log(opts)
    await loadData(opts)
}

main().catch(e => console.log(e.stack || e));
