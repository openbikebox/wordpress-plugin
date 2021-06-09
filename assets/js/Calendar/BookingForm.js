import React from 'react';
import PropTypes from 'prop-types';
import DateSelectorRow from './DateSelectorRow';
import TimeSelectorRow from './TimeSelectorRow';
import {compareDateWithoutTime} from './CalendarHelper';

const BookingForm = (props) => {
    const [beginHour, _setBeginHour] = React.useState(null);
    const [beginMinute, _setBeginMinute] = React.useState(null);
    const [endHour, _setEndHour] = React.useState(null);
    const [endMinute, _setEndMinute] = React.useState(null);
    const [beginSame, setBeginSame] = React.useState(false);
    const [endSame, setEndSame] = React.useState(false);

    const updateBeginAndEndSame = () => {
        setBeginSame(compareDateWithoutTime(props.bookingBegin, props.today) === 0);
        setEndSame(compareDateWithoutTime(props.bookingEnd, props.bookingBegin) === 0);
    };

    const setBeginAndEndSame = (to) => {
        setBeginSame(to);
        setEndSame(to);
    };

    const setBeginMinute = (newBeginMinute) => {
        if (props.bookingBegin) {
            props.setBookingBegin(new Date(props.bookingBegin.getFullYear(), props.bookingBegin.getMonth(), props.bookingBegin.getDate(), beginHour, newBeginMinute));
        } else {
            _setBeginMinute(newBeginMinute);
        }
    };

    const setBeginHour = (newBeginHour) => {
        if (props.bookingBegin) {
            props.setBookingBegin(new Date(props.bookingBegin.getFullYear(), props.bookingBegin.getMonth(), props.bookingBegin.getDate(), newBeginHour, beginMinute));
        } else {
            _setBeginHour(newBeginHour);
        }
    };

    const setEndMinute = (newEndMinute) => {
        if (props.bookingEnd) {
            props.setBookingEnd(new Date(props.bookingEnd.getFullYear(), props.bookingEnd.getMonth(), props.bookingEnd.getDate(), endHour, newEndMinute));
        } else {
            _setEndMinute(newEndMinute);
        }
    };

    const setEndHour = (newEndHour) => {
        if (props.bookingEnd) {
            props.setBookingEnd(new Date(props.bookingEnd.getFullYear(), props.bookingEnd.getMonth(), props.bookingEnd.getDate(), newEndHour, endMinute));
        } else {
            _setEndHour(newEndHour);
        }
    };

    React.useEffect(() => {
        if (props.bookingBegin) {
            _setBeginMinute(props.bookingBegin.getMinutes());
            _setBeginHour(props.bookingBegin.getHours());
            updateBeginAndEndSame();
        } else {
            _setBeginMinute(null);
            _setBeginHour(null);
            setBeginAndEndSame(false);
        }
    }, [props.bookingBegin]);

    React.useEffect(() => {
        if (props.bookingEnd) {
            _setEndMinute(props.bookingEnd.getMinutes());
            _setEndHour(props.bookingEnd.getHours());
            updateBeginAndEndSame();
        } else {
            _setEndMinute(null);
            _setEndHour(null);
            setBeginAndEndSame(false);
        }
    }, [props.bookingEnd]);

    return <form onSubmit={props.submit} ref={props.submitRef}>
        <h3>Buchung</h3>
        <h4>Von</h4>
        <div className={'calendar-booking-container'}>
            <DateSelectorRow setDate={props.setBookingBegin} yearId={'calendar-booking-begin-year-input'}
                             monthId={'calendar-booking-begin-month-input'} date={props.bookingBegin}
                             minDate={props.today} dayId={'calendar-booking-begin-day-input'}/>
            <TimeSelectorRow hourId={'calendar-booking-begin-hour-input'}
                             minuteId={'calendar-booking-begin-minute-input'}
                             minHour={beginSame ? props.today.getHours() : 0} setHour={setBeginHour} hour={beginHour}
                             minMinute={beginSame ? props.today.getMinutes() : 0} setMinute={setBeginMinute}
                             minute={beginMinute}/>
            <h4>Bis</h4>
            <DateSelectorRow setDate={props.setBookingEnd} yearId={'calendar-booking-end-year-input'}
                             monthId={'calendar-booking-end-month-input'} date={props.bookingEnd}
                             minDate={props.bookingBegin ?? undefined} dayId={'calendar-booking-end-day-input'}/>
            <TimeSelectorRow hourId={'calendar-booking-end-hour-input'}
                             minuteId={'calendar-booking-end-minute-input'}
                             minHour={endSame ? beginHour : 0} hour={endHour} setHour={setEndHour}
                             minMinute={endSame ? beginMinute : 0} minute={endMinute} setMinute={setEndMinute}/>
        </div>
        <button type="submit" className="button is-success" disabled={!props.bookingBegin || !props.bookingEnd}>
            Buchung abschicken
        </button>
    </form>;
};

BookingForm.propTypes = {
    bookingBegin: PropTypes.object,
    setBookingBegin: PropTypes.func.isRequired,
    bookingEnd: PropTypes.object,
    setBookingEnd: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    submitRef: PropTypes.object.isRequired,
};

export default BookingForm;
