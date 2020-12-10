const { DAYS, DAYS_HEADER, DAYS_IN_WEEK, MONTHS_HEADER } = require('../../util/variables');
const { getHeader } = require('../../util/mainController');
const mainModel = require('../Models/mainModel');
const { get } = require('../../routes/main');

/** get this week's calendar and events
 * - get today's date
 * - get year, date, month, year
 * - for loop is create the entire week 
 *      for each day, 
 *          > create date object, with day name, header, and date
 *          > for today, set current to true
 *          > push into currentWeek array
 *          > check to see if that day's month is different from today's month
 *              - get that day's month
 *              - if that day is after today, then add that month before today's month
 *              - if that day is before today, then add that month after today's month
 * - if block after the for loop is used to determine the year(s) in header
 *      if the header has multiple months, add the current year and the next year
 *      if the header has a single month, add the current year
 */
module.exports.getCurrentCalendar = (req, res) => {
    const today = new Date(Date.now());
    const DOW = today.getDay();
    const date = today.getDate();
    const month = today.getMonth();
    let year = today.getFullYear();
    let nextYear;
    const currentWeek = [];
    let dateHeader = `${MONTHS_HEADER[month]}`;
    let startDay, endDay;
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
        const diff = DOW - i;
        const next = new Date(year, month, date - diff);
        if (i === 0) {
            startDay = `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()}`;
            if (month !== next.getMonth()) [dateHeader, nextYear] = getHeader(diff, next, dateHeader, year);
        }
        else if (i === DAYS_IN_WEEK - 1) {
            endDay = `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()}`;
            if (month !== next.getMonth()) [dateHeader, nextYear] = getHeader(diff, next, dateHeader, year);
        }
        const dateObject = {
            day: DAYS[i],
            header: DAYS_HEADER[i],
            date: next.getDate(),
            events: []
        };
        if (next.getDate() === date) dateObject.current = true;
        
        currentWeek.push(dateObject);
    }
    if (dateHeader.includes('Jan')) {
        dateHeader = dateHeader.split('-');
        if (year < nextYear) {
            dateHeader[0] += year + ' ';
            dateHeader[1] += ' ' + nextYear;
        } else {
            dateHeader[0] += nextYear + ' ';
            dateHeader[1] += ' ' + year;
        }
        dateHeader = dateHeader.join('-');
    } else {
        dateHeader += ` ${year}`;
    }
    const context = {
        currentWeek,
        dateHeader
    };
    mainModel.getAllEvents(startDay, endDay, results => {
        context['data'] = results;
        res.render('index.ejs', context);
    });
}

module.exports.addEvent = (req, res) => {
    const when = req.body.date;
    const from = req.body.time_of_day_from + ":00";
    const to = req.body.time_of_day_to + ":00";
    const title = req.body.title;
    const location = req.body.location;
    mainModel.addEvent(when, from, to, title, location);
    res.redirect('/');
};