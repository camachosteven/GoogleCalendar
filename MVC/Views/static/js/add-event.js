calendarDays.forEach((current, element) => {
    current.addEventListener('click', event => {
        const clickedForm = event.target.closest('.add__event--form');
        if (!clickedForm) {
            const oldForm = document.querySelector('.add__event--form');
            if (oldForm) oldForm.parentNode.removeChild(oldForm);
            const currentDay = calendarHeaders.find(ele => ele.id === current.id);
            let currentDate = currentDay.querySelector('.day-of-month').textContent;
            if (currentDate.length === 1) currentDate = '0' + currentDate;
            let hour = event.target.closest('.calendar__event').id.split("");
            let meridian = "";
            for (let i = hour.length - 1; i >= 0; i--) {
                if (!parseInt(hour[i]) && hour[i] !== '0') meridian += hour.pop();
                else break;
            }
            hour = parseInt(hour.join(""));
            if (meridian.includes('a')) {
                if (hour === 12) hour = 0;
            } else {
                if (hour != 12) hour += 12;
            }
            let month = document.querySelector('.calendar__nav p').textContent;
            let year;
            if (month.includes('-')) {
                month = month.split('-');
                for (let i = 0; i < month.length; i++) {
                    month[i] = month[i].trim();
                    if (i > 0) {
                        year = month[i].split(' ')[1];
                        month[i] = month[i].split(' ')[0];
                    }
                }
                const firstMonth = month.split(' ')[0];
                const secondMonth = month.split(' ')[1];
                if (currentDate < 10) month = MONTHS.findIndex(cur => cur === firstMonth);
                else month = MONTHS.findIndex(cur => cur === secondMonth);
            } else {
                const firstMonth = month.split(' ')[0];
                year = month.split(' ')[1];
                month = MONTHS.findIndex(cur => cur === firstMonth);
            }
            month += 1;
            const beginningHour = hour < 10 ? '0' + hour: hour;
            let endingHour = hour + 1 < 10 ? '0' + (hour + 1): hour + 1;
            endingHour = endingHour === 24 ? "00" : endingHour;
            const form = document.createElement('form');
            const formContent = `
                <input name="title" class="add__event--input add__event--title" type="text" placeholder="Event Title">
                <div>
                    <img src="img/calendar.svg" width="16px" height="16px">
                    <input name="when" class="add__event--input add__event--date" type="text" value="December 16, 2020">
                </div>
                <div>
                    <img src="img/clock.svg" width="16px" height="16px">
                    <input name="time" class="add__event--input add__event--time" type="text" placeholder="Ex: 7:00pm - 8:00pm">
                </div>
                <div>
                    <img src="img/location.png" width="16px" height="16px">
                    <input name="location" class="add__event--input add__event--location" type="text" placeholder="Miami, FL">
                </div>             
                <button class="add__event--submit" type="submit">Add Event</button>
            `;
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

/** How to get location of where to place form
 * - find which day was chosen
 * - get width
 */

