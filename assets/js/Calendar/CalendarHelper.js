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
    let checkDatePlusOne = new Date(checkDate);
    checkDatePlusOne.setDate(checkDatePlusOne.getDate() + 1);
    return startDate < checkDatePlusOne && endDate > checkDate;
};

export const calculateDateDiff = (startDate, endDate, excludeEndMoment) => {
    let calculatedEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (excludeEndMoment && endDate.getHours() === 0 && endDate.getMinutes() === 0)
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 1);
    const diffMs = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - calculatedEndDate;
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

        let beginDateOfMonth = booking.begin.getDate();
        let beginDate = new Date(booking.begin.getFullYear(), booking.begin.getMonth(), beginDateOfMonth);
        let beginTime = beginDate.getTime();
        let endDate = new Date(booking.end.getFullYear(), booking.end.getMonth(), booking.end.getDate());
        let endTime = endDate.getTime();

        let startEndComparison = beginTime === endTime ? 0 : (beginTime < endTime ? -1 : 1);
        let beginDateString = beginDate.toDateString();
        if (startEndComparison === -1) {
            pushToUnavailableDateBookings(unavailableDates, beginDateString, {
                partial: booking.begin.getHours() > 0 ? 'bottom' : false,
                begin: booking.begin,
            });

            pushToUnavailableDateBookings(
                unavailableDates,
                ((booking.end.getHours() === 0) ? new Date(endDate - 86400000) : endDate).toDateString(), // handle 0:00 next day
                {partial: booking.end.getHours < 23, end: booking.end},
            );

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
        let last;
        for (const booking of availability.bookings) {
            if (!booking.partial) {
                availability.available = false;
                break;
            }
            availability.partial = true;
            if (!earliest || booking.begin < earliest) {
                earliest = booking.begin;
            }
            if (!last || booking.end > last) {
                last = booking.end;
            }
        }
        availability.earliest = earliest;
        availability.last = last;
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

export const calculateNewBookingTime = (newBeginDate, newEndDate, maxMS, unavailableDates, startAt) => {
    if (newBeginDate > newEndDate) {
        throw new Error('Impossible new booking. End cannot be before begin. Start: ' + newBeginDate.toString() + ' End: ' + newEndDate.toString());
    }

    let errors = [];
    if (!newEndDate) {
        newEndDate = new Date(newBeginDate.getTime() + 3600000);
    }

    let tooLong = false;
    let bookingTooLong = checkBookingTooLong(newBeginDate, newEndDate, maxMS);
    if (bookingTooLong) {
        tooLong = true;
        if (startAt === 'begin') {
            newEndDate = fixBookingTooLongFromBegin(newBeginDate, maxMS);
        } else {
            newBeginDate = fixBookingTooLongFromEnd(newEndDate, maxMS);
        }
    }

    let noMoreUnavailable;
    if (compareDateWithoutTime(newBeginDate, newEndDate) === 0) {
        noMoreUnavailable = fixUnavailableSameDayStartAtBegin(newBeginDate, newEndDate, unavailableDates);
        // TODO: start at end
    } else {
        noMoreUnavailable = startAt === 'begin'
            ? fixUnavailableStartAtBegin(newBeginDate, newEndDate, unavailableDates)
            : fixUnavailableStartAtEnd(newBeginDate, newEndDate, unavailableDates);
    }

    if (noMoreUnavailable[0]) {
        errors.push('unavailable');
        newBeginDate = noMoreUnavailable[1];
        newEndDate = noMoreUnavailable[2];
    } else if (tooLong) {
        errors.push('tooLong');
    }

    return {begin: newBeginDate, end: newEndDate, errors: errors};
};

const checkBookingTooLong = (newBeginDate, newEndDate, maxMS) => {
    return maxMS && Math.abs(newEndDate - newBeginDate) > maxMS;
};

const fixBookingTooLongFromBegin = (newBeginDate, maxMS) => {
    return new Date(newBeginDate.getTime() + maxMS);
};

const fixBookingTooLongFromEnd = (newEndDate, maxMS) => {
    return new Date(newEndDate.getTime() - maxMS);
};

const getNearestAvailableDate = (tryDate, unavailableDates, stepSize, minDate, maxDate) => {
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
        if (stepSize > 0) {
            if (dateAvailable.earliest > tryDate) {
                tryDate = dateAvailable.earliest;
                changed = true;
            }
        } else {
            if (dateAvailable.last < tryDate) {
                tryDate = dateAvailable.last;
                changed = true;
            }
        }
    }
    return [changed, tryDate];
};

const getFurthestAvailableDateInFrame = (start, unavailableDates, stepSize, min, max) => {
    let containsUnavailable = false;
    let returnDate = start;
    let compareDate = new Date(start.getTime());
    let lastTime = compareDate.getTime();
    let tempAvailable = checkIfDateAvailable(new Date(compareDate), unavailableDates);

    let first = true; // TODO: This is not a good solution. Fix when there is time for it.
    while (tempAvailable.available && ((compareDateWithoutTime(compareDate, min) > 0 && compareDateWithoutTime(max, compareDate) > 0 && !tempAvailable.partial) || first)) {
        first = false;
        lastTime = compareDate.getTime();
        compareDate.setTime(compareDate.getTime() + stepSize);
        tempAvailable = checkIfDateAvailable(compareDate, unavailableDates);
    }

    if (!tempAvailable.available) {
        returnDate = new Date(lastTime);
        containsUnavailable = true;
    } else if (tempAvailable.partial) {
        returnDate = stepSize > 0 ? tempAvailable.earliest : tempAvailable.last;
        containsUnavailable = true;
    }

    return [containsUnavailable, returnDate];
};

const fixUnavailableStartAtBegin = (newBeginDate, newEndDate, unavailableDates) => {
    let containsUnavailable = false;
    const earliestPossibleBegin = getNearestAvailableDate(newBeginDate, unavailableDates, 8.64e+7, newBeginDate, newEndDate);
    if (earliestPossibleBegin[0]) {
        containsUnavailable = true;
        newBeginDate = earliestPossibleBegin[1];
    }

    const lastPossibleEnd = getFurthestAvailableDateInFrame(newBeginDate, unavailableDates, 8.64e+7, newBeginDate, newEndDate);
    if (lastPossibleEnd[0]) {
        containsUnavailable = true;
        newEndDate = lastPossibleEnd[1];
    }

    return [containsUnavailable, newBeginDate, newEndDate];
};

const fixUnavailableStartAtEnd = (newBeginDate, newEndDate, unavailableDates) => {
    const lastPossibleEnd = getNearestAvailableDate(newEndDate, unavailableDates, -8.64e+7, newBeginDate, newEndDate);
    let containsUnavailable = lastPossibleEnd[0];
    newEndDate = lastPossibleEnd[1];

    const earliestPossibleBegin = getFurthestAvailableDateInFrame(newEndDate, unavailableDates, -8.64e+7, newBeginDate, newEndDate);
    if (earliestPossibleBegin[0]) {
        containsUnavailable = true;
        newBeginDate = earliestPossibleBegin[1];
    }

    return [containsUnavailable, newBeginDate, newEndDate];
};

const fixUnavailableSameDayStartAtBegin = (newBeginDate, newEndDate, unavailableDates) => {
    const dayAvailability = checkIfDateAvailable(newBeginDate, unavailableDates);
    if (dayAvailability.partial === false) {
        let unavailable = false;
        if (dayAvailability.bookings.length > 1) {
            for (const booking of dayAvailability.bookings) {
                if (booking.begin >= newEndDate || booking.end <= newBeginDate) {
                    // All good
                    continue;
                }
                unavailable = true;

                if (newBeginDate < booking.begin && newEndDate > booking.begin && newEndDate < booking.end) {
                    newEndDate = booking.begin;
                } else {
                    newBeginDate = booking.end;
                }

                if (newBeginDate > newEndDate) {
                    newEndDate = newBeginDate;
                }
            }
        } else {
            if (dayAvailability.from > newBeginDate) {
                newBeginDate = dayAvailability.from;
                unavailable = true;
            }
            if (dayAvailability.until < newEndDate) {
                newEndDate = dayAvailability.until;
                if (newEndDate < newBeginDate) {
                    newEndDate = newBeginDate;
                }
                unavailable = true;
            }
        }
        return [unavailable, newBeginDate, newEndDate];
    } else {
        return [!dayAvailability.available, newBeginDate, newEndDate];
    }
};

export const calculatePrice = (priceGroup, startDate, endDate) => {
    const prices = [];
    if (priceGroup.fee_year) {
        prices.push({name: 'Jahre', ms: 3.154e+10, fee: priceGroup.fee_year});
    }
    if (priceGroup.fee_day) {
        prices.push({name: 'Monate', ms: 2.678e+9, fee: priceGroup.fee_month});
    }
    if (priceGroup.fee_week) {
        prices.push({name: 'Wochen', ms: 6.048e+8, fee: priceGroup.fee_week});
    }
    if (priceGroup.fee_day) {
        prices.push({name: 'Tage', ms: 8.64e+7, fee: priceGroup.fee_day});
    }
    if (priceGroup.fee_hour) {
        prices.push({name: 'Stunden', ms: 3.6e+6, fee: priceGroup.fee_hour});
    }

    let remainder = endDate.getTime() - startDate.getTime();
    let calcPrice = 0;
    for (const price of prices) {
        let divisor = (Math.floor(remainder / price.ms));
        if (divisor > 0) {
            calcPrice += divisor * price.fee;
            remainder = remainder % price.ms;
        }
    }
    return calcPrice;
};

export const getStartOfDate = (date) => {
    const newDate = new Date(date.getTime());
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
};

export const getEndOfDate = (date) => {
    const newDate = new Date(date.getTime());
    newDate.setHours(23);
    newDate.setMinutes(59);
    newDate.setSeconds(59);
    newDate.setMilliseconds(999);
    return newDate;
};

export const dateTimeFormatOptions = {dateStyle: 'short', timeStyle: 'short'}
