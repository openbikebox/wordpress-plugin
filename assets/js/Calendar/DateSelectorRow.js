import React from 'react';
import {checkInRange, getDaysInMonth} from './CalendarHelper';
import PropTypes from 'prop-types';
import DateTimeInputWarning from './DateTimeInputWarning';

const DateSelectorRow = (props) => {
    const [yearValid, setYearValid] = React.useState(true);
    const [monthValid, setMonthValid] = React.useState(true);
    const [dayValid, setDayValid] = React.useState(true);

    const currentDate = new Date();
    const defaultDate = props.date ?? currentDate;
    const firstYear = props.minDate ? props.minDate.getFullYear() : (props.pastAllowed ? currentDate.getFullYear() - 1 : currentDate.getFullYear());
    const [year, setYear] = React.useState(defaultDate.getFullYear());
    const [month, setMonth] = React.useState(defaultDate.getMonth() + 1);
    const [day, setDay] = React.useState(defaultDate.getDate());
    const [localChange, setLocalChange] = React.useState(false);

    React.useEffect(() => {
        if (props.date) {
            setYear(props.date.getFullYear());
            setMonth(props.date.getMonth() + 1);
            setDay(props.date.getDate());
        }
        setYearValid(true);
        setMonthValid(true);
        setDayValid(true);
        setLocalChange(false);
    }, [props.date]);

    const createDate = (newYear, newMonth, newDay) => {
        if (props.minDate) {
            return new Date(newYear, newMonth - 1, newDay, props.minDate.getHours(), props.minDate.getMinutes(), props.minDate.getSeconds(), props.minDate.getMilliseconds());
        }
        return new Date(newYear, newMonth - 1, newDay);
    };

    const updateDate = (newDate) => {
        if (props.minDate && newDate < props.minDate) {
            if (props.minDate.getMonth() === newDate.getMonth()) {
                props.setDate(props.minDate);
                return true;
            }
            return false;
        }
        if (props.maxDate && newDate > props.maxDate) {
            return false;
        }
        props.setDate(newDate);
        setLocalChange(false);
        return true;
    };

    const handleYearChange = (e) => {
        const newYear = e.target.value;
        if (checkInRange(newYear, e.target)) {
            setYearValid(updateDate(createDate(newYear, month, day)));
        } else {
            setLocalChange(true);
            setYear(newYear);
            setYearValid(false);
        }
    };

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        if (checkInRange(newMonth, e.target)) {
            setMonthValid(updateDate(createDate(year, newMonth, day)));
        } else {
            setLocalChange(true);
            setMonth(newMonth);
            setMonthValid(false);
        }
    };

    const handleDayChange = (e) => {
        const newDay = e.target.value;
        if (checkInRange(newDay, e.target)) {
            setDayValid(updateDate(createDate(year, month, newDay)));
        } else {
            setLocalChange(true);
            setDay(newDay);
            setDayValid(false);
        }
    };

    const sameYear = props.minDate && props.minDate.getFullYear() === year;
    const sameMonth = sameYear && props.minDate.getMonth() + 1 === month;

    const lastYear = props.maxDate && props.maxDate.getFullYear() === year;
    const lastMonth = lastYear && props.maxDate.getMonth() + 1 === month;

    const getMinDay = () => {
        return sameMonth ? props.minDate.getDate() : 1;
    };

    const getMaxDay = () => {
        return lastMonth ? props.maxDate.getDate() : getDaysInMonth(year, month - 1);
    };

    const getMinMonth = () => {
        return sameYear ? props.minDate.getMonth() + 1 : 1;
    };

    const getMaxMonth = () => {
        return lastYear ? props.maxDate.getMonth() : 12;
    };

    const getMaxYear = () => {
        return props.maxDate ? props.maxDate.getFullYear() : firstYear + 2;
    };

    return <React.Fragment>
        <div className="calendar-booking-date-input">
            <label htmlFor={props.dayId}>Tag</label>
            <input type="number" id={props.dayId} min={getMinDay()} max={getMaxDay()}
                   value={props.date || localChange ? day : ''}
                   onChange={handleDayChange} className="calendar-numeric-input"/>
            <DateTimeInputWarning min={getMinDay()} max={getMaxDay()} show={!dayValid}/>
        </div>
        <div className="calendar-booking-date-input">
            <label htmlFor={props.monthId}>Monat</label>
            <input type="number" id={props.monthId} min={getMinMonth()} max={getMaxMonth()}
                   value={props.date || localChange ? month : ''}
                   onChange={handleMonthChange} className="calendar-numeric-input"/>
            <DateTimeInputWarning min={getMinMonth()} max={getMaxMonth()} show={!monthValid}/>
        </div>
        <div className="calendar-booking-date-input">
            <label htmlFor={props.yearId}>Jahr</label>
            <input type="number" id={props.yearId} min={firstYear} max={getMaxYear()}
                   value={props.date || localChange ? year : ''}
                   onChange={handleYearChange} className="calendar-numeric-input"/>
            <DateTimeInputWarning min={firstYear} max={getMaxYear()} show={!yearValid}/>
        </div>
    </React.Fragment>;
};

DateSelectorRow.propTypes = {
    minDate: PropTypes.object,
    maxDate: PropTypes.object,
    date: PropTypes.object,
    setDate: PropTypes.func.isRequired,
    yearId: PropTypes.string.isRequired,
    monthId: PropTypes.string.isRequired,
    dayId: PropTypes.string.isRequired,
    pastAllowed: PropTypes.bool,
};

export default DateSelectorRow;
