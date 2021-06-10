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
