calendarDays.forEach((current, element) => {
    // for each day in the calendar, add a click event where you can create event in a forsm
    current.addEventListener('click', event => {
        const clickedForm = event.target.closest('.add__event--form');
        /** if you don't click on the form, create a form for the corresponding event date
         *  if you do, then do nothing
         */
        if (!clickedForm) {
            // remove the old form and get both today and the last day of week
            const oldForm = document.querySelector('.add__event--form');
            if (oldForm) oldForm.parentNode.removeChild(oldForm);
            const currentDay = calendarHeaders.find(ele => ele.id === current.id);
            const lastDay = calendarHeaders[calendarHeaders.length - 1];

            // get today's date and the last day's date
            const currentDate = parseInt(currentDay.querySelector('.day-of-month').textContent);
            const lastDate = parseInt(lastDay.querySelector('.day-of-month').textContent);

            // get the hour of the target clicked on
            let hour = event.target.closest('.calendar__event');
            if (hour) hour = hour.id.split("");

            // remove last 2 characters of hour, which contain the meridian
            // afterwards, convert into number
            let meridian = "";
            for (let i = hour.length - 1; i >= 0; i--) {
                if (!parseInt(hour[i]) && hour[i] !== '0') meridian += hour.pop();
                else break;
            }
            hour = parseInt(hour.join(""));
            let beginningHour, endingHour; 

            /** 
             * if one of the last 2 chars is a, means it is AM 
             * - if hour isn't 12am simply interpolate into string and its now startHour
             * - determine endHour by adding 1 to startHour and seeing if it is 12 (noon)
             *      > if so, then it's now PM
             * else it is PM
             * - if hour isn't 12pm simply interpolate into string, now startHour
             * - determine endHour by adding 1 to startHour and seeing if it is 24 (midnight)
             *      > if so, then it's now AM
             */ 
            if (meridian.includes('a')) {
                if (hour === 12) {
                    hour = 0;
                    beginningHour = '12:00am';
                    endingHour = '1:00am';
                } else {
                    beginningHour = `${hour}:00am`; 
                    endingHour = (hour + 1 === 12) ? '12:00pm' : `${(hour + 1) % 12}:00am`; 
                }
            } else {
                if (hour != 12) {
                    hour += 12;
                    beginningHour = `${hour % 12}:00pm`;
                    endingHour = (hour + 1 === 24) ? '12:00am' : `${(hour + 1) % 12}:00pm`;
                } else {
                    beginningHour = `12:00pm`;
                    endingHour = '1:00pm';
                }
            }

            // get the header from nav
            let month = document.querySelector('.calendar__nav p').textContent;
            let year;
            let year2;

            /**
             * if there are multiple months, determine if there are multiple years as well
             * - if there aren't any multiple years, determine what month is today
             * if there is only one month, determine year
             */
            if (month.includes('-')) {
                month = month.split('-');

                // for each month, remove whitespace
                // if month contains space, split
                // if this is true for first, year is the second part
                // if true for second month, year2 is the second part
                // for example 'Nov - Dec 2020', only Dec 2020 has space, 
                // therefore 2020 is the year
                for (let i = 0; i < month.length; i++) {
                    month[i] = month[i].trim();
                    if (month[i].includes(' ')) {
                        const temp = month[i].split(' ');
                        if (i === 0) year = parseInt(temp[1]);
                        else year2 = parseInt(temp[1]);
                        month[i] = temp[0];
                    }
                }
                const firstMonth = month[0];
                const secondMonth = month[1];

                // check if date is before last date
                // if so, it means either that is anywhere in the first month, or very beginning
                // of second month, else always date in first month
                if (currentDate <= lastDate) {
                    if (lastDate > 10) month = MONTHS.findIndex(cur => cur === firstMonth);
                    else month = MONTHS.findIndex(cur => cur === secondMonth);
                } else {
                    month = MONTHS.findIndex(cur => cur === firstMonth);
                }
            } else {
                const firstMonth = month.split(' ')[0];
                year = parseInt(month.split(' ')[1]);
                month = MONTHS.findIndex(cur => cur === firstMonth);
            }
            month += 1;
            if (month === 1) year = year2;

            // once i've determined month and year, create prepopulated input (date and time)
            // create form element and all content inside in form of string
            const date = `${FULL_MONTHS[month - 1]} ${currentDate}, ${year}`;
            const form = document.createElement('form');
            const formContent = `
                <input name="title" class="add__event--input add__event--title ${errors.has('title') ? 'add__event--input-negative' : ''}" type="text" placeholder="Event Title">
                <div>
                    <img src="/img/calendar.svg" width="16px" height="16px">
                    <input name="when" class="add__event--input add__event--date ${errors.has('when') ? 'add__event--input-negative' : ''}" type="text" value="${date}">
                </div>
                <div>
                    <img src="/img/clock.svg" width="16px" height="16px">
                    <input name="time" class="add__event--input add__event--time ${errors.has('time') ? 'add__event--input-negative' : ''}" type="text" value="${beginningHour} - ${endingHour}" placeholder="Ex: 7:00pm - 8:00pm">
                </div>
                <div>
                    <img src="/img/location.png" width="16px" height="16px">
                    <input name="location" class="add__event--input add__event--location ${errors.has('location') ? 'add__event--input-negative' : ''}" type="text" placeholder="Miami, FL">
                </div>
                <input type="hidden" name="formDate" value="${month} ${currentDate} ${year} ${hour}">
                <button class="add__event--submit" type="submit">Add Event</button>
            `;

            // add final attributes and add to page
            form.action = '/add-event/';
            form.method = 'POST';
            form.classList.add('add__event--form');
            const locationLeft = (element === calendarDays.length - 1) ? -150 : columnWidth;
            form.style.left = `${locationLeft}px`;
            form.style.top = `0px`;
            form.innerHTML = formContent;
            current.appendChild(form);
        }
    });
});

if (errors.has('formDate')) {
    // get form date, day and hour
    const date = errors.get('formDate');
    const day = date.split(' ')[1];
    const formHour = parseInt(date.split(' ')[3]);
    let index;

    // determine what day of the week it is
    for (let i = 1; i < calendarHeaders.length; i++) {
        const dayOfMonth = calendarHeaders[i].querySelector('.day-of-month');
        if (dayOfMonth.textContent === day) {
            index = i - 1;
            break;
        }
    }
    // get that day's event slots
    const eventSlots = Array.from(calendarDays[index].children);
    
    // determine what hour was the form in previously
    for (let i = 0; i < eventSlots.length; i++) {
        const current = eventSlots[i];
        let hour = parseInt(current.id.substring(0, current.id.length - 2));
        if (current.id.includes('am') && hour === 12) hour = 0;
        else if (current.id.includes('pm') && !current.id.includes('12')) hour += 12;
        if (formHour === hour) {
            index = i;
            break;
        }
    }
    eventSlots[index].click(); // trigger the form again

    // render error messages on top of calendar
    let errorContent = '';
    for (const [key, value] of errors) {
        let realKey = '';
        if (key === 'when') realKey = 'date';
        else if (key === 'formDate') continue;
        else realKey = key;
        const firstLetter = realKey.charAt(0).toUpperCase();
        realKey = `${firstLetter}${realKey.substring(1, realKey.length)}`;
        errorContent += `
            <p class="calendar__form--error">${realKey}: ${value}</p>
        `;
    }
    calendar.insertAdjacentHTML('beforebegin', errorContent);
}

