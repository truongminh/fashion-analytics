const { Sequence, Parallel } = require('../lib/flow');
const { Today } = require('../lib/util');

const settings = {
    tz: 'Asia/Ho_Chi_Minh',
    listing_parallel: 1,
    details_parallel: 6
};

const brand = 'ivymoda';

module.exports = async function (opts) {
    const seed = require('./init');
    const stages = [
        Parallel(require('./listing'), settings.listing_parallel),
        Parallel(require('./details'), settings.details_parallel),
        require('./saver'),
    ];
    const time_key = Today(settings.tz);
    const ctx = {
        brand, time_key, ...opts,
    };
    await Sequence(ctx, seed, stages);
}
