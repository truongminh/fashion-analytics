const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);
const { Pipe } = require('./lib');
const MongoClient = require('mongodb').MongoClient;

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'brands-crawl';

(async () => {
    const mgClient = new MongoClient(mongoUrl);
    try{
        await mgClient.connect();
        console.log('Connected to MongoDB sucessfully');
        const db = client.db(dbName);
    }catch(err){
        console.log('Failed to connect to Mongo client');
    }

    const startDate = new Date().getTime();
    Pipe.Pipeline(
        require('./ninomax/init'),
        require('./ninomax/listing'),
        require('./ninomax/details')
    ).on('data', console.log);
})();
