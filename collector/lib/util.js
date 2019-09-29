
const { utcToZonedTime, format } = require('date-fns-tz');
const Today = (timeZone) => format(utcToZonedTime(new Date(), timeZone), 'yyyy-MM-dd', { timeZone });

module.exports = {
    Today
}
