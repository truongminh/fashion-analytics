const { MongoClient } = require('mongodb');
const { sha1 } = require('object-hash');

async function Connect({ url }) {
    const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await client.connect();
    const db = client.db();
    return db;
};


async function SaverFactory({ DB_URL }) {
    const db = await Connect({ url: DB_URL });
    const kvStore = db.collection('kv');
    console.log('Connected to mongodb');
    const existed = async ({ brand, time_key, product_url }) => {
        const col = db.collection(brand);
        const count = await col.countDocuments({ time_key, product_url });
        return count > 0;
    }
    const storeValue = async (metadata, value) => {
        const key = sha1(value);
        const existed = await kvStore.countDocuments({ _id: key });
        if (existed) {
            return key;
        }
        await kvStore.insertOne({ metadata, value, _id: key });
        return key;
    }
    const upsert = async ({ brand, time_key, product }) => {
        const type = 'product';
        const product_ref = await storeValue({ brand, type }, product);
        const col = db.collection(brand);
        const ctime = new Date();
        const { product_url } = product;
        const query = { time_key, product_url };
        const $set = { time_key, product_url, ctime, product_ref };
        return col.updateOne(query, { $set }, { upsert: true });
    };
    return {
        name: 'mongodb',
        existed,
        upsert
    }
}

async function TrackingFactory({ DB_URL }) {
    const db = await Connect({ url: DB_URL });
    const colTracking = db.collection('tracking');
    const start = (group, metadata) => {
        const stime = new Date();
        const end = () => {
            const etime = new Date();
            const duration = etime - stime;
            const doc = { group, metadata, stime, etime, duration };
            colTracking.insertOne(doc);
        }
        return { end };
    }
    return { start };
}

module.exports = {
    SaverFactory,
    TrackingFactory
}
