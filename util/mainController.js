const { DAYS, DAYS_HEADER, DAYS_IN_WEEK, MONTHS_HEADER } = require('./variables');

module.exports.getHeader = (diff, next, header, year) => {
    const nextMonth = MONTHS_HEADER[next.getMonth()];
    if (diff < 0) return [`${header} - ${nextMonth}`, year + 1];
    else return [`${nextMonth} - ${header}`, year - 1];
};