import React from 'react';
import PropTypes from 'prop-types';
import MonthCalendarDay from './MonthCalendarDay';
import {compareMonthAndYear} from './CalendarHelper';
import {convertedBookingPropTypes} from './CalendarPropTypes';

const MonthCalendar = (props) => {
    const {today} = props;

    const [current, setCurrent] = React.useState(props.initialCurrent ?? new Date());
    const [present, setPresent] = React.useState(null);
    const [year, setYear] = React.useState(null);
    const [month, setMonth] = React.useState(null);
    const [day, setDay] = React.useState(null);
    const [firstDayOfMonth, setFirstDayOfMonth] = React.useState(null);
    const [daysInMonth, setDaysInMonth] = React.useState(null);
    const [lastDayInLastMonth, setLastDayInLastMonth] = React.useState(null);
    const [dragging, setDragging] = React.useState(false);


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
        setDay(newDay);
        setFirstDayOfMonth(new Date(newYear, newMonth, 1).getDay());
        setDaysInMonth(new Date(newYear, newMonth + 1, 0).getDate());
        setLastDayInLastMonth(new Date(newYear, newMonth, 0));
        setPresent(compareMonthAndYear(current, today));
    }, [current]);

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

    const getPreviousMonthDay = (days, c) => {
        const lastWeekdayInLastMonth = lastDayInLastMonth.getDay();
        let dayValue;
        if (c < lastWeekdayInLastMonth) {
            dayValue = lastDayInLastMonth.getDate() - (lastWeekdayInLastMonth - c);
        } else {
            dayValue = lastDayInLastMonth.getDate();
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
    let elapsed = 0;
    let weekCounter = 0;
    while (elapsed < daysInMonth) {
        let days = [];
        for (let c = 0; c < 7; c++) {
            let thisDate;
            if ((weekCounter === 0 && c < firstDayOfMonth)) {
                thisDate = new Date(year, month - 1, getPreviousMonthDay(days, c));
            } else {
                elapsed++;
                thisDate = new Date(year, month, elapsed);
            }
            days.push(<MonthCalendarDay date={thisDate} bookingBegin={props.bookingBegin}
                                        bookingEnd={props.bookingEnd} setBookingBegin={props.setBookingBegin}
                                        setBookingEnd={props.setBookingEnd} bookings={props.bookings}
                                        dragging={dragging} maxReached={props.maxReached}
                                        setDragging={setDragging}
                                        disabled={getDayDisabledState(elapsed)}/>);
        }
        weeks.push(days);
        weekCounter++;
    }

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
        {weeks.map((week, index) => {
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
    maxReached: PropTypes.bool.isRequired,
    today: PropTypes.object.isRequired,
    bookingBegin: PropTypes.object,
    bookingEnd: PropTypes.object,
    setBookingBegin: PropTypes.func.isRequired,
    setBookingEnd: PropTypes.func.isRequired,
    handleMonthSwitch: PropTypes.func,
    initialCurrent: PropTypes.object,
    allowPast: PropTypes.bool,
};

MonthCalendar.propTypes = {
    disableBack: PropTypes.bool,
    ...monthCalendarPropTypes,
};

export default MonthCalendar;
