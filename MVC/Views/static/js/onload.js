const calendar = document.querySelector('.calendar');
const calendarDays = Array.from(document.querySelectorAll('.calendar__day'));
const calendarHeaders = Array.from(document.querySelectorAll('.calendar__header--day'));
const columnWidth = (calendar.clientWidth - 50) / 7;