const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'ninomax';

let mongoClient;
let mongoDb;
exports.connect = async function(){
    if (!mongoClient ){
        mongoClient = new MongoClient(url)
        try {
            await mongoClient.connect()
            console.log('Connected correctly to server');
            mongoDb = mongoClient.db(dbName);
        }catch (err){
            console.log('Failed to connect to mongodb');
        }
    }
}