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
    console.log('Connected to mongodb');
    const existed = async (ctx, { brand, time_key, product_url }) => {
        const col = db.collection(brand);
        const count = await col.countDocuments({ time_key, product_url });
        return count > 0;
    }
    const upsert = async (ctx, { brand, ...params }) => {
        const col = db.collection(brand);
        const query = { time_key: params.time_key, product_url: params.product_url };
        return col.updateOne(query, { $set: params }, { upsert: true });
    };
    return {
        name: 'mongodb',
        existed,
        upsert
    }
}

module.exports = {
    RawDBFactory,
    DBFactory
}
