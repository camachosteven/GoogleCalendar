const { body, validationResult } = require('express-validator');
const { DAYS, DAYS_HEADER, DAYS_IN_WEEK, MONTHS_HEADER, FULL_MONTHS } = require('../../util/variables');
const { getHeader } = require('../../util/mainController');
const mainModel = require('../Models/mainModel');
const { end } = require('../../util/database');

module.exports.getCurrentCalendar = (req, res) => {
    const context = {};
    const today = new Date(2020, 11, 7);
    const DOW = today.getDay();
    const date = today.getDate();
    const month = today.getMonth();
    let year = today.getFullYear();
    let nextYear;
    const currentWeek = [];
    let dateHeader = `${MONTHS_HEADER[month]}`;
    let startDay, endDay;

    /** for loop
     * - this loop creates the entire week array
     * 1. calculate how far each day is to today
     * 2. create date based on that difference for that day's info
     * 3. store the first and last days of the week for database query later on
     * 4. create header with month(s) for nav bar
     * 5. create individual date object with day, header, actual date, and events array
     * 6. push into current week array
     */
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
        const diff = DOW - i;
        const next = new Date(year, month, date - diff);

        if (month !== next.getMonth()) [dateHeader, nextYear] = getHeader(diff, next, dateHeader, year);
        if (i === 0) startDay = `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()}`;
        else if (i === DAYS_IN_WEEK - 1) endDay = `${next.getFullYear()}-${next.getMonth() + 1}-${next.getDate()}`;
        
        const dateObject = {
            day: DAYS[i],
            header: DAYS_HEADER[i],
            date: next.getDate(),
            events: []
        };
        if (next.getDate() === date) dateObject.current = true;
        
        currentWeek.push(dateObject);
    } // end for

    /** if block
     * - this if else block finishes dateHeader by adding the year(s)
     * 1. if the dateHeader includes January, separate the months
     * 1b. add the smaller of the years to December, add larger to January
     * 2. else, simply add year
     */
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
    } // end if 

    context['dateHeader'] = dateHeader;

    /** get all events and render page
     * - this method gets all events from db, adds to each day of week, renders page
     * 1. if array is not empty and event date matches that day's date, add to events array
     * 2. else, go to next day
     * 3. add to context, render page
     */
    mainModel.getAllEvents(startDay, endDay, results => {
        currentWeek.forEach(day => {
            let more = true;
            do {
                if (results.length !== 0 && results[0].when.getDate() === day.date) day.events.push(results.shift());
                else more = false; 
            } while (more);
        });
        context['currentWeek'] = currentWeek;
        res.render('index.ejs', context);
    });
}

module.exports.addEvent = async (req, res) => {
    // this block checks if the 'when' input has a validation error
    var errors = validationResult(req);
    const array = errors.array();
    let whenError = false;
    for (let i = 0; i < array.length; i++) {
        if (array[i].param === 'when') {
            whenError = true;
            break;
        }
    }

    /** if block
     * - this block makes additional validations if when has no errors. 
     * 1. if when has no error, convert into start and end data for db
     * 2. after sanitization, check if there is an event for that same time
     * 3. 
     */
    if (!whenError) {
        await body('time', 'Time is invalid. Example: X:XXam - Y:YYpm').customSanitizer((value, { req }) => {
            const times = value.split('-');
            let startHour = parseInt(times[0].split(':')[0]);
            let endHour = parseInt(times[1].split(':')[0]); 
            let startMeridian, endMeridian;
            if (startHour >= 10) startMeridian = times[0].split('').splice(5, 2).join('');
            else startMeridian = times[0].split('').splice(4, 2).join('');
            if (endHour >= 10) endMeridian = times[1].trim().split('').splice(5, 2).join('');
            else endMeridian = times[1].trim().split('').splice(4, 2).join('');
            console.log(startMeridian, endMeridian);
            if (startHour === 12 && startMeridian === 'am') startHour = 0;
            else if (startHour != 12 && startMeridian === 'pm') startHour += 12;
            if (endHour === 12 && endMeridian === 'am') endHour = 0;
            else if (endHour != 12 && endMeridian === 'pm') endHour += 12;
            let from = startHour < 10 ? `0${startHour}:00:00`: `${startHour}:00:00`;
            let to = endHour < 10 ? `0${endHour}:00:00`: `${endHour}:00:00`;
            req.body.from = from;
            req.body.to = to;
            return value;
        }).custom(async (value, { req }) => {
            const from = req.body.from;
            const to = req.body.to;
            const when = req.body.when;
            const events = await mainModel.getEvent(when, from, to);
            if (events.length > 0) throw new Error('There is already an event within those times.');
            return true;
        }).run(req);
    }

    /**
     * - this block checks all errors on the inputs
     * 1. if error array is not empty, encode each error into a querystring
     * 2. add the date for which the input was entered
     */
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return error message
        let errorQuery = '?';
        errors.array().forEach(current => {
            errorQuery += `${current.param}=${encodeURIComponent(current.msg)}&`;
        });
        errorQuery += `formDate=${encodeURIComponent(req.body.formDate)}`;
        return res.redirect('/' + errorQuery); 
    }

    const when = req.body.when;
    const location = req.body.location;
    const title = req.body.title;
    const from = req.body.from;
    const to = req.body.to;
    mainModel.addEvent(when, from, to, title, location, () => res.redirect('/'));
};