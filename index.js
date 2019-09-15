(async () => {
    const startDate = new Date().getTime();
    const ctx = {};
    const it = require('./ninomax')(ctx);
    for await(const data of it) {
        console.log(data);
    }
})();
