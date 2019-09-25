const { Sequence, Parallel } = require('../lib/flow');
const { utcToZonedTime, format } = require('date-fns-tz');
const Today = (timeZone) => format(utcToZonedTime(new Date(), timeZone), 'yyyy-MM-dd', { timeZone });

const ninomax = {
    tz: 'Asia/Ho_Chi_Minh',
    listing_parallel: 2,
    details_parallel: 8
};

module.exports = async function (opts) {
    const brand = 'ninomax';
    const seed = require('./init');
    const stages = [
        Parallel(require('./listing'), ninomax.listing_parallel),
        Parallel(require('./details'), ninomax.details_parallel),
        require('./saver'),
    ];
    const time_key = Today(ninomax.tz);
    const ctx = {
        brand, time_key, ...opts,
    };
    await Sequence(ctx, seed, stages);
}
