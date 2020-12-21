const { body,validationResult } = require('express-validator');
const { DAYS, DAYS_HEADER, DAYS_IN_WEEK, MONTHS_HEADER, FULL_MONTHS } = require('../../util/variables');
const { getHeader } = require('../../util/mainController');
const mainModel = require('../Models/mainModel');

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
    const context = {};
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
    mainModel.getAllEvents(startDay, endDay, results => {
        currentWeek.forEach(day => {
            let more = true;
            do {
                if (results[0] && results[0].when.getDate() === day.date) day.events.push(results.shift());
                else more = false; 
            } while (more);
        });
        context['currentWeek'] = currentWeek;
        context['dateHeader'] = dateHeader;
        res.render('index.ejs', context);
    });
}
// '7:00pm - 8:30pm'
module.exports.addEvent = async (req, res) => {
    await body('when').trim().custom(value => {
        const date = value.split(' ');
        const month = FULL_MONTHS[date[0]];
        const day = parseInt(date[1]);
        const year = parseInt(date[2]);
        if (!month) return new Error('Month is not valid. Please enter entire month capitalized (December).');
        if (!year) return new Error('Year is not valid. Enter a valid year.');
        if (!day && day <= new Date(year, month, 0).getDate()) return new Error('Day is not valid. Please enter a date within month of event.');
        return true;
    }).bail().customSanitizer(value => {
        const date = value.split(' ');
        return `${parseInt(date[2])}-${FULL_MONTHS[date[0]]}-${parseInt(date[1])}`;
    }).run(req);

    var errors = validationResult(req);
    const array = errors.array();
    let whenError = false;
    for (let i = 0; i < array.length; i++) {
        if (array[i].param === 'when') {
            whenError = true;
            break;
        }
    }
    if (whenError) {
        await body('time', 'Time is invalid. Example: X:XXam - Y:YYpm').custom(value => {
            const times = value.split('-');
            if (!times.length === 1) throw new Error();
            let startHour = parseInt(times[0].split(':')[0]);
            let endHour = parseInt(times[1].split(':')[0]);
            if (!(startHour && endHour)) throw new Error();
            const startMeridian = times[0].split('').splice(4, 2).join('');
            const endMeridian = times[1].trim().split('').splice(4, 2).join('');
            if (!(startMeridian && endMeridian)) throw new Error();
            return true;
        }).run(req);
    } else {
        await body('time', 'Time is invalid. Example: X:XXam - Y:YYpm').custom(value => {
            const times = value.split('-');
            if (!times.length === 1) throw new Error();
            let startHour = parseInt(times[0].split(':')[0]);
            let endHour = parseInt(times[1].split(':')[0]);
            if (!(startHour && endHour)) throw new Error();
            const startMeridian = times[0].split('').splice(4, 2).join('');
            const endMeridian = times[1].trim().split('').splice(4, 2).join('');
            if (!(startMeridian && endMeridian)) throw new Error();
            return true;
        }).bail().customSanitizer((value, { req }) => {
            const times = value.split('-');
            let startHour = parseInt(times[0].split(':')[0]);
            let endHour = parseInt(times[1].split(':')[0]); 
            const startMeridian = times[0].split('').splice(4, 2).join('');
            const endMeridian = times[1].trim().split('').splice(4, 2).join('');
            if (startHour === 12 && startMeridian === 'am') startHour = 0;
            else if (startHour > 12) startHour += 12;
            if (endHour === 12 && endHour === 'am') endHour = 0;
            else if (endHour > 12) endHour += 12;
            let from = startHour < 10 ? `0${startHour}:00:00`: `${startHour}:00:00`;
            let to = endHour < 10 ? `0${endHour}:00:00`: `${endHour}:00:00`;
            req.body.from = from;
            req.body.to = to;
            return value;
        }).custom(async (value, { req }) => {
            const from = req.body.from;
            const to = req.body.to;
            const when = req.body.when;
            const events = await getEvent(when, from, to);
            if (events.length > 0) throw new Error('There is already an event within those times.');
            return true;
        }).run(req);
    }
    errors = validationResult(req);
    console.log(errors.array());
    if (!errors.isEmpty()) {
        // return error message
        let errorQuery = '?';
        errors.array().forEach(current => {
            errorQuery += `${current.param}=${encodeURIComponent(current.msg)}&`;
        });
        errorQuery = errorQuery.substring(0, errorQuery.length - 1);
        return res.redirect('/' + errorQuery);
    }
    const when = req.body.when;
    const time = req.body.time;
    const location = req.body.location;
    const title = req.body.title;
    const from = req.body.from;
    const to = req.body.to;
    res.redirect('/');
    //mainModel.addEvent(when, from, to, title, location, () => res.redirect('/'));
};