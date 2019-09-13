const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);
const { Pipe } = require('./lib');

(async () => {
    const startDate = new Date().getTime();
    Pipe.Pipeline(
        require('./ninomax/init'),
        require('./ninomax/listing'),
        require('./ninomax/details')
    ).on('data', console.log);
})();
