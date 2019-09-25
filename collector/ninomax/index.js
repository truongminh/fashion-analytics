const { Sequence } = require('../lib/flow');
const { utcToZonedTime, format } = require('date-fns-tz');
const Today = (timeZone) => format(utcToZonedTime(new Date(), timeZone), 'yyyy-MM-dd', { timeZone });
const timeZone = 'Asia/Ho_Chi_Minh';

module.exports = async function (opts) {
    const brand = 'ninomax';
    const seed = require('./init');
    const stages = [
        require('./listing'),
        require('./details'),
        require('./saver'),
    ];
    const time_key = Today(timeZone);
    const ctx = {
        brand, time_key, ...opts,
    };
    await Sequence(ctx, seed, stages);
}
