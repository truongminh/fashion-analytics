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

async function RawDBFactory({RAW_DB_URL}){
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
    const colName = 'products'

    const existed = async (ctx, { brand, time_key, product_url }) => {
        const col = db.collection(brand);
        const count = await col.countDocuments({ time_key, product_url });
        return count > 0;
    }
    
    const upsertProduct = async({brand, ...params}) => {
        const col = db.collection(colName)
        let data = {
            description : params.product_description,
            name : params.product_name,
            number : params.product_number,
            url : params.product_url,
            parent_url : params.parent_url,
            currency : params.currency,
            last_update_date : params.time_key,
            last_price : params.product_price,
        }
        const query = {brand: brand, product_url : params.product_url};
        return col.updateOne(query, {$set : data}, {upsert : true});
    };

    return {
        name: 'mongodb',
        existed,
        upsertProduct
    }
}

module.exports = {
    RawDBFactory,
    DBFactory
}
