const router = require('express').Router();
const { body } = require('express-validator');
const { FULL_MONTHS } = require('../util/variables');
const mainController = require('../MVC/Controllers/mainController');
const { getEvent } = require('../MVC/Models/mainModel');

router.get('/', mainController.getCurrentCalendar);
router.post('/add-event/',
    [
        body('title').trim().isLength({ min: 1, max: 20 }),
        body('location').trim().isLength({ min: 1, max: 30 })
    ],
    mainController.addEvent);

module.exports = router;