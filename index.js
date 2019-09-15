const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);
const { Pipe } = require('./lib');
const mongodb = require('./db/mgdb');

(async () => {
    
    mongoClient = mongodb.connect();

    const startDate = new Date().getTime();
    Pipe.Pipeline(
        require('./ninomax/init'),
        require('./ninomax/listing'),
        require('./ninomax/details')
    ).on('data', console.log);
})();
