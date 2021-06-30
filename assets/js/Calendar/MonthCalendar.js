import React from 'react';
import PropTypes from 'prop-types';
import MonthCalendarDay from './MonthCalendarDay';
import {checkIfDateActive, checkIfDateAvailable, compareMonthAndYear} from './CalendarHelper';
import {convertedBookingPropTypes} from './CalendarPropTypes';

const getCalendarWeeks = (year, month, day, present, unavailableDates, newBookingBegin, newBookingEnd, dragging, setDragging, lastSet, setBookingBegin, setBookingEnd, setBookingBeginAndEnd, today) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekdayInMonth = new Date(year, month, 1).getDay();
    const lastDayInLastMonth = new Date(year, month, 0);
    const lastDateInLastMonth = lastDayInLastMonth.getDate();
    const lastWeekdayInLastMonth = lastDayInLastMonth.getDay();

    const getPreviousMonthDay = (c) => {
        let dayValue;
        if (c < lastWeekdayInLastMonth) {
            dayValue = lastDateInLastMonth - (lastWeekdayInLastMonth - c);
        } else {
            dayValue = lastDateInLastMonth;
        }
        return dayValue;
    };

    const getDayDisabledState = (elapsed) => {
        if (present === 0) {
            return elapsed < day;
        } else {
            return present === -1;
        }
    };

    let weeks = [];
    let weekCounter = 0;
    let elapsed = 0;

    while (elapsed < daysInMonth) {
        let days = [];
        for (let c = 0; c < 7; c++) {
            let thisDate;
            if (weekCounter === 0 && c < firstWeekdayInMonth) {
                thisDate = new Date(year, month - 1, getPreviousMonthDay(c));
            } else {
                elapsed++;
                thisDate = new Date(year, month, elapsed);
            }
            const available = checkIfDateAvailable(thisDate, unavailableDates);
            const active = checkIfDateActive(thisDate, newBookingBegin, newBookingEnd);
            days.push(<MonthCalendarDay
                date={thisDate}
                disabled={getDayDisabledState(elapsed)}
                available={available}
                active={active}
                today={today}
                isToday={present === 0 && day === elapsed}
                dragging={dragging}
                setDragging={setDragging}
                lastSet={lastSet}
                setBookingBegin={setBookingBegin}
                setBookingEnd={setBookingEnd}
                bookingBegin={newBookingBegin}
                bookingEnd={newBookingEnd}
                setBookingBeginAndEnd={setBookingBeginAndEnd}
            />);
        }
        weekCounter++;
        weeks.push(days);
    }
    return weeks;
};

const MonthCalendar = (props) => {
    const {today} = props;

    const [current, setCurrent] = React.useState(props.initialCurrent ?? new Date());
    const [present, setPresent] = React.useState(null);
    const [year, setYear] = React.useState(null);
    const [month, setMonth] = React.useState(null);
    const [daysInMonth, setDaysInMonth] = React.useState(null);
    const [dragging, setDragging] = React.useState(false);
    const [calendarWeeks, setCalendarWeeks] = React.useState([]);

    React.useEffect(() => {
        if (props.initialCurrent) {
            setCurrent(props.initialCurrent);
        }
    }, [props.initialCurrent]);

    React.useEffect(() => {
        const newYear = current.getFullYear();
        const newMonth = current.getMonth();
        const newDay = current.getDate();
        setYear(newYear);
        setMonth(newMonth);
        setDaysInMonth(new Date(newYear, newMonth + 1, 0).getDate());

        const newPresent = compareMonthAndYear(current, today);
        setCalendarWeeks(getCalendarWeeks(newYear, newMonth, newDay, newPresent, props.unavailableDates,
            props.bookingBegin, props.bookingEnd, dragging, setDragging, props.lastSet, props.setBookingBegin,
            props.setBookingEnd, props.setBookingBeginAndEnd, props.today));
        setPresent(newPresent);
    }, [current, props.unavailableDates, props.bookingBegin, props.bookingEnd]);

    const switchMonth = (newCurrent, back) => {
        if (props.handleMonthSwitch) {
            props.handleMonthSwitch(back);
        } else {
            if (compareMonthAndYear(newCurrent, today) === 0) {
                newCurrent = new Date();
            }
            setCurrent(newCurrent);
        }
    };

    const goToPreviousMonth = () => {
        switchMonth(new Date(year, month, 0), true);
    };

    const goToNextMonth = () => {
        switchMonth(new Date(year, month, daysInMonth + 1), false);
    };

    const handlePreviousMonthClick = () => {
        if (props.allowPast || present === 1) {
            goToPreviousMonth();
        }
    };

    const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    return <div className="calendar" onMouseLeave={() => setDragging(false)} onMouseUp={() => setDragging(false)}>
        <div className="calendar-heading-row">
            <button disabled={props.disableBack || !props.allowPast && present !== 1}
                    aria-label="Zum vorherigen Monat springen"
                    className="calendar-change-month-button calendar-last-month-button"
                    onClick={handlePreviousMonthClick}>
                ‹
            </button>
            <h3>{current.toLocaleDateString('de-DE', {year: 'numeric', month: 'long'})}</h3>
            <button aria-label="Zum nächsten Monat springen" onClick={goToNextMonth}
                    className="calendar-change-month-button calendar-next-month-button">
                ›
            </button>
        </div>
        <div className="calendar-week">
            {weekDays.map((weekDay) => <div key={'calendarWeekDay' + weekDay}
                                            className="calendar-week-day">{weekDay}</div>)}
        </div>
        {calendarWeeks.map((week, index) => {
            return <div className="calendar-week" key={'calendarWeek' + index}>
                {week.map((day, dayIndex) => {
                    return <React.Fragment
                        key={'calendarWeek' + index + 'Day' + dayIndex}>{day}</React.Fragment>;
                })}
                <br/>
            </div>;
        })}
    </div>;
};

export const monthCalendarPropTypes = {
    bookings: PropTypes.arrayOf(PropTypes.shape(convertedBookingPropTypes)).isRequired,
    unavailableDates: PropTypes.object, //TODO Shape?
    maxReached: PropTypes.bool.isRequired,
    today: PropTypes.object.isRequired,
    lastSet: PropTypes.oneOf(['begin', 'end']).isRequired,
    bookingBegin: PropTypes.object,
    bookingEnd: PropTypes.object,
    setBookingBegin: PropTypes.func.isRequired,
    setBookingEnd: PropTypes.func.isRequired,
    setBookingBeginAndEnd: PropTypes.func.isRequired,
    handleMonthSwitch: PropTypes.func,
    initialCurrent: PropTypes.object,
    allowPast: PropTypes.bool,
};

MonthCalendar.propTypes = {
    disableBack: PropTypes.bool,
    ...monthCalendarPropTypes,
};

export default MonthCalendar;
