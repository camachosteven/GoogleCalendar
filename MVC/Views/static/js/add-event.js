calendarDays.forEach((current, element) => {
    current.addEventListener('click', event => {
        const clickedForm = event.target.closest('.add__event--form');
        if (clickedForm) {
            
        } else {
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
                <label class="add__event--label" for="date">Date:</label>
                <input type="date" name="date" value="${year}-${month}-${currentDate}">
                <label class="add__event--label" for="time_of_day_from">From:</label>
                <input class="add__event--time" type="time" name="time_of_day_from" value="${beginningHour}:00">
                <label class="add__event--label" for="time_of_day_to">To:</label>
                <input class="add__event--time" type="time" name="time_of_day_to" value="${endingHour}:00">
                <label class="add__event--label" for="title">Title:</label>
                <input class="add__event--title" type="text" name="title">
                <label class="add__event--label" for="location">Location:</label>
                <input class="add__event--location" type="text" name="location">
                <button type="submit">Add Event</button>
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

