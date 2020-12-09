const router = require('express').Router();
const mainController = require('../MVC/Controllers/mainController');

router.get('/', mainController.getCurrentCalendar);
router.post('/add-event/', mainController.addEvent);

module.exports = router;