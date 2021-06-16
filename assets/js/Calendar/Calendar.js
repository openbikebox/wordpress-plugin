import React from 'react';
import PropTypes from 'prop-types';
import DayCalendar from './DayCalendar';
import MonthCalendar from './MonthCalendar';
import MultiMonthCalendar from './MultiMonthCalendar';
import BookingForm from './BookingForm';
import AsapCalendar from './AsapCalendar';
import {compareDateWithoutTime, getUnavailableDates} from './CalendarHelper';
import {rawBookingPropTypes} from './CalendarPropTypes';

const CalendarMeta = (props) => {
    return <div aria-live="assertive" aria-relevant="additions text">
        <p>
            <span className="calendar-meta-display calendar-warning-display">
                {props.maxReached && props.maxReachedWarning}
            </span>
        </p>
        <p><span className="calendar-meta-display calendar-error-display">{props.errorString}</span></p>
    </div>;
};

CalendarMeta.propTypes = {
    maxReached: PropTypes.bool.isRequired,
    maxReachedWarning: PropTypes.string,
    errorString: PropTypes.string,
};

const Calendar = (props) => {
    const today = new Date();

    const [view, setView] = React.useState(props.initialView ?? 'day');
    const [errorString, setErrorString] = React.useState('');
    const [errors, _setErrors] = React.useState(new Map());
    const [maxReached, setMaxReached] = React.useState(false);
    const [bookingBegin, _setBookingBegin] = React.useState();
    const [bookingEnd, _setBookingEnd] = React.useState();
    const [bookings, setBookings] = React.useState([]);
    const [unavailableDates, setUnavailableDates] = React.useState(new Map());
    const [lastSet, setLastSet] = React.useState('end');

    const getNewDateWhilePreservingTimeIfNeeded = (oldDate, newDate) => {
        if (newDate) {
            if (oldDate) {
                const newHours = newDate.getHours();
                const oldHours = oldDate.getHours();
                if (newHours === 0 && oldHours !== newHours) {
                    newDate.setHours(oldHours, oldDate.getMinutes());
                }
            }
            if (compareDateWithoutTime(newDate, today) === 0) {
                const newHours = newDate.getHours(); // Fetch here again because it could've been changed in previous if block
                const newMinutes = newDate.getMinutes();
                const todayHours = today.getHours();
                const todayMinutes = today.getMinutes();
                if (newHours < todayHours || (newHours === todayHours && newMinutes <= todayMinutes)) {
                    newDate.setHours(todayHours, todayMinutes);
                }
            }
        }
        return newDate;
    };

    const setBookingBegin = (newBookingBegin) => {
        setLastSet('begin');
        _setBookingBegin(getNewDateWhilePreservingTimeIfNeeded(bookingBegin, newBookingBegin));
    };

    const setBookingEnd = (newBookingEnd) => {
        setLastSet('end');
        _setBookingEnd(getNewDateWhilePreservingTimeIfNeeded(bookingEnd, newBookingEnd));
    };

    React.useEffect(() => {
        let newBookings = [];
        if (props.bookings) {
            for (const booking of props.bookings) {
                newBookings.push({begin: new Date(booking.begin), end: new Date(booking.end)});
            }
        }

        //TODO: new bookings even needed at this point?
        setBookings(newBookings);
        setUnavailableDates(getUnavailableDates(newBookings));
    }, [props.bookings]);

    const submitRef = React.useRef(null);

    const maxReachedWarning = 'Sie haben die längste mögliche Buchnungszeit von ' + props.maxBookingLength + ' Tagen erreicht.';

    const setErrors = (newErrors) => {
        let newErrorString = '';
        newErrors.forEach((error) => {
            newErrorString = <>{newErrorString}{error}<br/></>;
        });
        setErrorString(newErrorString);
        _setErrors(newErrors);
    };

    const addError = (key, value) => {
        if (!errors.has(key)) {
            let newErrors = errors;
            newErrors.set(key, value);
            setErrors(newErrors);
        }
    };

    const removeError = (error) => {
        if (errors.has(error)) {
            let newErrors = errors;
            newErrors.delete(error);
            setErrors(newErrors);
        }
    };

    const handleViewChange = (e) => {
        setView(e.target.value);
    };

    return <div>
        <CalendarMeta maxReached={maxReached} errorString={errorString} maxReachedWarning={maxReachedWarning}/>
        <p><span className="calendar-view-change-meta-label">Ansicht:</span>
            <input type="radio" name="view" value="asap" className="calendar-view-radio" checked={view === 'asap'}
                   onChange={handleViewChange} id="calendar-view-radio-asap"/>
            <label htmlFor="calendar-view-radio-asap">Sofort</label>
            <input type="radio" name="view" value="day" className="calendar-view-radio" checked={view === 'day'}
                   onChange={handleViewChange} id="calendar-view-radio-day"/>
            <label htmlFor="calendar-view-radio-day">Tag</label>
            <input type="radio" name="view" value="month" className="calendar-view-radio" checked={view === 'month'}
                   onChange={handleViewChange} id="calendar-view-radio-month"/>
            <label htmlFor="calendar-view-radio-month">Monat</label>
            <input type="radio" name="view" className="calendar-view-radio" value="3months" checked={view === '3months'}
                   onChange={handleViewChange} id="calendar-view-radio-3months"/>
            <label htmlFor="calendar-view-radio-3months">3 Monate</label>
        </p>
        {view === 'asap' &&
        <AsapCalendar today={today} setBookingBegin={setBookingBegin} setBookingEnd={setBookingEnd}
                      submitRef={submitRef} bookings={bookings}/>}
        {view === 'day' &&
        <DayCalendar bookings={bookings}/>}
        {view === 'month' &&
        <MonthCalendar bookings={bookings} bookingBegin={bookingBegin} bookingEnd={bookingEnd} today={today} unavailableDates={unavailableDates}
                       maxReached={maxReached} setBookingBegin={setBookingBegin} setBookingEnd={setBookingEnd} lastSet={lastSet}/>}
        {view === '3months' &&
        <MultiMonthCalendar monthCount={3} bookings={bookings} maxReached={maxReached} bookingBegin={bookingBegin}
                            bookingEnd={bookingEnd} today={today} setBookingBegin={setBookingBegin} unavailableDates={unavailableDates}
                            setBookingEnd={setBookingEnd} lastSet={lastSet}/>}
        <CalendarMeta maxReached={maxReached} maxReachedWarning={maxReachedWarning} errorString={errorString}/>
        <BookingForm bookingBegin={bookingBegin} setBookingBegin={setBookingBegin} bookingEnd={bookingEnd}
                     setBookingEnd={setBookingEnd}
                     today={today} submitRef={submitRef}
                     submit={(e) => {
                         e.preventDefault();
                         console.log('submit');
                     }}/>
    </div>;
};

Calendar.propTypes = {
    bookings: PropTypes.arrayOf(PropTypes.shape(rawBookingPropTypes)).isRequired,
    maxBookingLength: PropTypes.number, //TODO: seconds, not days
    initialView: PropTypes.oneOf(['day', 'month', '3months', 'asap']),
};

export default Calendar;
