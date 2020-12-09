const variables = require('../../util/variables');
const mainModel = require('../Models/mainModel');

module.exports.getCurrentCalendar = (req, res) => {
    const today = new Date(Date.now());
    const DOW = today.getDay();
    const date = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();
    const currentWeek = [];
    let dateHeader = `${variables.MONTHS_HEADER[month]}`;
    let singleMonth = true;
    for (let i = 0; i < variables.DAYS_IN_WEEK; i++) {
        const diff = DOW - i;
        const next = new Date(year, month, date - diff);
        const dateObject = {
            day: variables.DAYS[i],
            header: variables.DAYS_HEADER[i],
            date: next.getDate()
        };
        if (next.getDate() === date) dateObject.current = true;
        currentWeek.push(dateObject);
        if (month !== next.getMonth() && singleMonth) {
            const nextMonth = variables.MONTHS_HEADER[next.getMonth()];
            if (diff < 0) dateHeader += ` - ${nextMonth}`; 
            else dateHeader = `${nextMonth} - ${dateHeader}`;
            singleMonth = false;
        }
    }
    if (dateHeader.includes('Jan')) {
        dateHeader = dateHeader.split('-');
        dateHeader[0] += year + ' ';
        dateHeader[1] += ' ' + (year + 1);
        dateHeader = dateHeader.join('-');
    } else {
        dateHeader += ` ${year}`;
    }
    const context = {
        currentWeek,
        dateHeader
    };
    mainModel.getAllEvents(results => {
        console.log(results);
    });
    res.render('index.ejs', context);
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