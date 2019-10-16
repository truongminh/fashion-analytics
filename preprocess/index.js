const fs = require('fs')
const assert = require('assert')
const {RawDBFactory, DBFactory} = require('./lib/mgo');
const { sha1 } = require('object-hash');

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

async function pushProducts(opts, brand) {
    ctx = {}
    
    docCursor = await opts.rawdb.list(ctx, brand)
    while (await docCursor.hasNext()){
        product = await docCursor.next()
        
        //find the corresponding category tags from the listing url
        urldoc = await opts.db.findTags(product.parent_url)
        if (urldoc){
            let data = {
                _id : sha1(product.product_url),
                description : product.product_description,
                name : product.product_name,
                number : product.product_number,
                parent_url : product.parent_url,
                currency : product.currency,
                last_crawle_date : product.time_key,
                last_price : product.product_price,
                categories : urldoc.categories,
                group : urldoc.group
            }
    
            const query = {brand: brand, url : product.product_url};

            ret = await opts.db.upsertProduct(query, data)

        }else{
            console.log("something unexpected: " + product.parent_url + " is not tagged yet")
        }
    }
}

async function brandAssortment(opts, group, brand) {
    catCursor = await opts.db.listCategories({})
    while( await catCursor.hasNext()){
        cat = await catCursor.next()
        const count = await opts.db.countProduct({brand:brand, group:group, cattagids:cat._id})
        if (count > 0){
            console.log('category ', cat._id, " has count:  ", count)
        }
    }
    console.log('done')
}

async function main() {
    const opts = await init();
    //console.log(opts)
    brand = 'ninomax'    
    group = 'women'
    await pushProducts(opts, brand)
    //await brandAssortment(opts, group, brand)
}

main().catch(e => console.log(e.stack || e));
