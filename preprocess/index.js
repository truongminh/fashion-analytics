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

function isProductPriceChange(oldProduct, curProduct){
    if (oldProduct.sale != curProduct.sale ||
        oldProduct.price != curProduct.price ||
        oldProduct.price_sale != curProduct.price_sale){
        return true
    }else{
        return false
    }
}

function extractPriceRecord(product){
    priceRecord = {
        product_id: product._id, 
        price:product.price, 
        sale_price:product.price_sale, 
        on_sale:product.on_sale, 
        date:new Date(product.last_upate_date)
    }
    return priceRecord
}

async function updateProducts(opts, brand) {
    try {
        ctx = {}
        docCursor = await opts.rawdb.list(ctx, brand)
        prodRef = await opts.rawdb.findOneAndDeleteProductRef(ctx, brand, {})
        while (prodRef.value !== null) {
            productKv  = await opts.rawdb.findOneProduct(ctx, {_id : prodRef.value.product_ref})
            if (productKv !== null){
                product =  productKv.value
                //find the corresponding category tags from the listing url
                urldoc = await opts.db.findTags(product.parent_url)
                if (urldoc){
                    let finalProduct = {
                        _id : sha1(product.product_url),
                        url : product.product_url,
                        description : product.product_description,
                        brand : brand,
                        name : product.product_name,
                        number : product.product_number,
                        parent_url : product.parent_url,
                        currency : product.currency,
                        last_update_date : new Date(product.time_key),
                        price : product.product_price,
                        price_sale : product.product_price_sale,
                        on_sale : product.on_sale,
                        categories : urldoc.categories,
                        group : urldoc.group
                    }
            
                    const query = {url : product.product_url};

                    ret = await opts.db.updateProduct(query, finalProduct)
                    //two cases for a new price record
                    //1. we have a new product => new price record
                    //2. product already exists but price changes
                    if ( ret.value === null || 
                        (ret.value !== null && isProductPriceChange(ret.value, finalProduct))){
                        //new product
                        priceRecord = extractPriceRecord(finalProduct)
                        pret = await opts.db.insertOnePriceRecord(priceRecord)
                    }
                }else{
                    console.log("something unexpected: " + product.parent_url + " is not tagged yet")
                }
            }
            prodRef = await opts.rawdb.findOneAndDeleteProductRef(ctx, brand, {})
        }
    }catch (error){
        console.log(error)
    }
}

async function main() {
    const opts = await init();
    const brands = ["ninomax", "canifa", "ivymoda"]
    try{
        Promise.all(brands.map(async (brand) =>  {
            await updateProducts(opts, brand)
        }))
    }catch(error){
        console.log(error.stack || e)
    }
}

main()
