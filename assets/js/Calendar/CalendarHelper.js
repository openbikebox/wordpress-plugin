/**
 * This file contains functions that may be used at multiple positions or that are too complicated to be contained
 * by a component.
 *
 * TODO: 100% code coverage, at least for this file.
 */

/**
 * Compares month and year of two Date objects.
 * Returns 1 if a is later and -1 if b is.
 * Returns 0 if both dates are in the same month of the same year.
 */
export const compareMonthAndYear = (a, b) => {
    const yearA = a.getFullYear();
    const yearB = b.getFullYear();
    if (yearA === yearB) {
        const monthA = a.getMonth();
        const monthB = b.getMonth();
        return monthA === monthB ? 0 : (monthA > monthB ? 1 : -1);
    }
    return yearA > yearB ? 1 : -1;
};

export const compareDateWithoutTime = (a, b) => {
    const monthAndYearComparison = compareMonthAndYear(a, b);
    if (monthAndYearComparison !== 0) {
        return monthAndYearComparison;
    }

    const aDate = a.getDate();
    const bDate = b.getDate();
    if (aDate > bDate) {
        return 1;
    } else if (aDate < bDate) {
        return -1;
    }
    return 0;
};

export const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

export const checkInRange = (value, target) => {
    value *= 1; // Make sure number comparison is used instead of string comparison
    return (target.attributes.min.value <= value && value <= target.attributes.max.value);
};

export const checkInDateRange = (startDate, endDate, checkDate) => {
    //TODO: add partial check (i.e start = 1.6.21 15:00, date = 1.6.21 result = secondHalf)
    const compareStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
    const compareEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
    return compareStartDate <= checkDate && checkDate <= compareEndDate;
};

export const calculateDateDiff = (startDate, endDate) => {
    const diffMs = (new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const pushToUnavailableDateBookings = (unavailableDates, index, value) => {
    if (!unavailableDates[index]) {
        unavailableDates[index] = [];
    }
    if (!unavailableDates[index]['bookings']) {
        unavailableDates[index]['bookings'] = [];
    }
    unavailableDates[index]['bookings'].push(value);
    return unavailableDates;
};

export const getUnavailableDates = (bookings) => {
    // TODO: allow for multiple entries for a single day
    let unavailableDates = new Map();
    for (const booking of bookings) {
        if (booking.begin > booking.end) {
            throw error('Invalid booking. End time cannot be before start time.');
        }

        const beginDateOfMonth = booking.begin.getDate();
        const beginDate = new Date(booking.begin.getFullYear(), booking.begin.getMonth(), beginDateOfMonth);
        const beginTime = beginDate.getTime();
        const endDate = new Date(booking.end.getFullYear(), booking.end.getMonth(), booking.end.getDate());
        const endTime = endDate.getTime();
        const startEndComparison = beginTime === endTime ? 0 : (beginTime < endTime ? -1 : 1);
        const beginDateString = beginDate.toDateString();

        if (startEndComparison === -1) {
            pushToUnavailableDateBookings(unavailableDates, beginDateString, unavailableDates[beginDateString] = {
                partial: booking.begin.getHours() > 0 ? 'bottom' : 'false',
                begin: booking.begin,
            });
            pushToUnavailableDateBookings(unavailableDates, endDate.toDateString(), {
                partial: booking.end.getHours < 23,
                end: booking.end,
            });

            const betweenDate = new Date(beginDate.getTime());
            let c = beginDateOfMonth + 1;
            while (betweenDate.setDate(c) && betweenDate < endDate) {
                pushToUnavailableDateBookings(unavailableDates, betweenDate.toDateString(), {partial: false});
                c++;
            }
        } else if (startEndComparison === 0) {
            let partial = 'false';
            let beginTime = null;
            let endTime = null;
            if (booking.begin.getHours() > 0) {
                partial = true;
                beginTime = booking.begin;
            }
            if (booking.end.getHours() < 23) {
                partial = true;
                endTime = booking.end;
            }
            pushToUnavailableDateBookings(unavailableDates, beginDateString, {
                partial: partial,
                begin: beginTime,
                end: endTime,
            });
        } else {
            // Should not happen. Still throw an error in case it somehow does.
            throw 'Invalid booking. End time cannot be before start time.';
        }
    }
    return unavailableDates;
};

export const checkIfDateAvailable = (date, unavailableDates) => {
    let availability = {available: true};
    const unavailableDate = unavailableDates[date.toDateString()];
    if (unavailableDate && unavailableDate.bookings) {
        availability.bookings = unavailableDate.bookings;
        let earliest;
        let latest;
        for (const booking of availability.bookings) {
            if (!booking.partial) {
                availability.available = false;
                break;
            }
            availability.partial = true;
            if (!earliest || booking.begin < earliest) {
                earliest = booking.begin;
            }
            if (!latest || booking.end > latest) {
                latest = booking.end;
            }
        }
        availability.earliest = earliest;
        availability.latest = latest;
    }
    return availability;
};

export const checkIfDateActive = (date, newBookingBegin, newBookingEnd) => {
    let active = {active: false, partial: ''};
    if (newBookingBegin && newBookingEnd && checkInDateRange(newBookingBegin, newBookingEnd, date)) {
        active.active = true;

        const beginDay = new Date(newBookingBegin.getFullYear(), newBookingBegin.getMonth(), newBookingBegin.getDate());
        const endDay = new Date(newBookingEnd.getFullYear(), newBookingEnd.getMonth(), newBookingEnd.getDate());
        const thisDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const thisTime = thisDay.getTime();

        if (beginDay.getTime() === thisTime && newBookingBegin.getHours() > 0) {
            active.from = newBookingBegin;
            active.partial = 'bottom';
        }
        if (endDay.getTime() === thisTime && newBookingEnd.getHours() < 23) {
            active.until = newBookingEnd;
            active.partial = active.partial === 'bottom' ? 'switch' : 'top';
        }
    }
    return active;
};

export const calculateNewBookingTime = (newBeginDate, newEndDate, maxMS) => {
    let errors = [];
    if (!newEndDate) {
        newEndDate = new Date(newBeginDate.getTime() + 3600000);
    }

    const bookingTooLong = checkBookingTooLong(newBeginDate, newEndDate, maxMS);
    if (bookingTooLong[0]) {
        newEndDate = bookingTooLong[1];
        errors.push('tooLong');
    }

    return {begin: newBeginDate, end: newEndDate, errors: errors};
};

const checkBookingTooLong = (newBeginDate, newEndDate, maxMS) => {
    let tooLong = false;
    if (Math.abs(newEndDate - newBeginDate) > maxMS) {
        tooLong = true;
        newEndDate = new Date(newBeginDate.getTime() + maxMS);
    }
    return [tooLong, newEndDate];
};

const getNearestAvailableDate = (tryDate, unavailableDates, stepSize, maxDate, minDate) => {
    let changed = false;
    let dateAvailable = checkIfDateAvailable(tryDate, unavailableDates);
    while (!dateAvailable.available && tryDate > minDate && tryDate < maxDate) {
        // Try next step
        tryDate = new Date(tryDate.getTime() + stepSize);
        dateAvailable = checkIfDateAvailable(tryDate, unavailableDates);
        changed = true;
    }
    if (tryDate < minDate || tryDate > maxDate) {
        throw 'RangeImpossible';
    }
    if (dateAvailable.partial) {
        for (const booking of dateAvailable.bookings) {
            if (booking.endTime && booking.endTime > tryDate) {
                tryDate = booking.endTime;
                changed = true;
            }
        }
    }
    return [tryDate, changed];
};

export const checkNewBookingContainsUnavailable = (newBeginDate, newEndDate, unavailableDates) => {

    if (newBeginDate > newEndDate) {
        throw error('Impossible new booking. End cannot be before begin.');
    }

    const earliestPossibleBegin = getNearestAvailableDate(newBeginDate, unavailableDates, 8.64e+7, newEndDate, newBeginDate);
    newBeginDate = earliestPossibleBegin[0];
    let containsUnavailable = earliestPossibleBegin[1];

    let tempEndDate = new Date(newBeginDate.getTime());
    let lastTempDate = tempEndDate.getTime();
    let tempAvailable = checkIfDateAvailable(tempEndDate, unavailableDates);
    while (compareDateWithoutTime(newEndDate, tempEndDate) === 1 && tempAvailable.available && !tempAvailable.partial) {
        lastTempDate = tempEndDate.getTime();
        tempEndDate.setTime(tempEndDate.getTime() + 8.64e+7);
        tempAvailable = checkIfDateAvailable(tempEndDate, unavailableDates);
    }

    if (!tempAvailable.available) {
        newEndDate = new Date(lastTempDate);
        containsUnavailable = true;
    } else if (tempAvailable.partial) {
        newEndDate = getNearestAvailableDate(newEndDate, unavailableDates, 36000, newEndDate, newEndDate)[0];
        containsUnavailable = true;
    }

    return [newBeginDate, newEndDate, containsUnavailable];
};
