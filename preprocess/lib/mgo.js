const { MongoClient } = require('mongodb');

async function Connect({ url }) {
    const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await client.connect();
    const db = client.db();
    return db;
};

async function RawDBFactory({RAW_DB_URL}) {
    console.log(RAW_DB_URL)
    const db = await Connect({url : RAW_DB_URL});
    console.log("Connected to mongodb");
    
    const list = async (ctx, brand) => {
        const col = db.collection(brand)
        const query = {}
        return col.find(query)
    };

    return {
        name : 'raw-mongodb',
        list
    }
}

async function DBFactory({ DB_URL }) {
    const db = await Connect({ url: DB_URL });
    const colProducts = 'products'
    const colListing = 'listingurl'
    const colCategory = 'category'
    const colPrice = 'product_prices'

    const existed = async (ctx, { brand, time_key, product_url }) => {
        const col = db.collection(brand);
        const count = await col.countDocuments({ time_key, product_url });
        return count > 0;
    }
    
    const countProduct = async(query) => {
        col = db.collection(colProducts)
        return col.countDocuments(query)
    }

    const findOneProduct = async(query) => {
        col = db.collection(colProducts)
        return col.findOne(query)
    }

    const listCategories = async(query) => {
        const col = db.collection(colCategory)
        return col.find(query)
    }

    const findTags = async(url) => {
        const col = db.collection(colListing)
        const tags = col.findOne({url:url})
        return tags
    }

    const updateProduct = async(query, data) => {
        const col = db.collection(colProducts)
        return col.findOneAndUpdate(query, {$set : data}, {upsert : true, returnNewDocument:false});
    };

    const insertOnePriceRecord = async(data) => {
        const col = db.collection(colPrice)
        return col.insertOne(data)
    }

    return {
        name: 'mongodb',
        existed,
        updateProduct,
        findTags,
        findOneProduct,
        listCategories,
        countProduct,
        insertOnePriceRecord,
    }
}

module.exports = {
    RawDBFactory,
    DBFactory
}
