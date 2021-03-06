const router = require('express').Router();
const { body } = require('express-validator');
const mainController = require('../MVC/Controllers/mainController');
const { FULL_MONTHS } = require('../util/variables');

router.get('/', mainController.getCurrentCalendar);
router.post('/add-event/',
    [
        body('title', 'Enter title no more than 20 characters.').trim().isLength({ min: 1, max: 20 }),
        body('location', 'Enter location no more than 30 characters.').trim().isLength({ min: 1, max: 30 }),
        body('when').trim().custom(value => {
            const date = value.split(' ');
            const month = FULL_MONTHS[date[0]];
            const day = parseInt(date[1]);
            const year = parseInt(date[2]);
            /**
             * check if each of the different components making up the date 
             * for day, make sure day is less than or equal to the last day of the month
             */
            if (!month) throw new Error('Month is not valid. Please enter entire month capitalized (December).');
            if (!year) throw new Error('Year is not valid. Enter a valid year.');
            if (!day && day <= new Date(year, month, 0).getDate()) throw new Error('Day is not valid. Please enter a date within month of event.');
            return true;
        }).bail().customSanitizer(value => {
            // create date input using YYYY-MM-DD format
            const date = value.split(' ');
            return `${parseInt(date[2])}-${FULL_MONTHS[date[0]]}-${parseInt(date[1])}`; 
        }),
        body('time', 'Time is invalid. Example: X:XXam - Y:YYpm').custom(value => {
            // check if the time has two hours 
            const times = value.split('-');
            if (!times.length === 1) throw new Error();

            // check if each time can have the hour parsed from
            let startHour = parseInt(times[0].split(':')[0]);
            let endHour = parseInt(times[1].split(':')[0]);
            if (!(startHour && endHour)) throw new Error();

            // check if each has a meridian
            // *must be improved, make sure you check for both single and double digit hours*
            // (see time custom sanitizer for reference)
            const startMeridian = times[0].split('').splice(4, 2).join('');
            const endMeridian = times[1].trim().split('').splice(4, 2).join('');
            if (!(startMeridian && endMeridian)) throw new Error();

            return true;
        })
    ],
    mainController.addEvent);

module.exports = router;