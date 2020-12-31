const { DAYS, DAYS_HEADER, DAYS_IN_WEEK, MONTHS_HEADER } = require('./variables');

module.exports.getHeader = (diff, next, header, year) => {
    /**
     * 1. get the day's month
     * 2. if the day is after the current day, add nextMonth at the end
     * 3. else add at the beginning
     */
    const nextMonth = MONTHS_HEADER[next.getMonth()];
    if (diff < 0) return [`${header} - ${nextMonth}`, year + 1];
    else return [`${nextMonth} - ${header}`, year - 1];
};