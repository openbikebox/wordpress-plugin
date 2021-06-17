import React from 'react';
import PropTypes from 'prop-types';
import {convertedBookingPropTypes} from './CalendarPropTypes';
import {compareDateWithoutTime} from './CalendarHelper';

const AsapCalendarBookingButton = (props) => {
    const {setBookingDuration, hourCount, text} = props;
    return <button className="button calendar-asap-booking-button" onClick={() => setBookingDuration(hourCount)}>
        {text}
    </button>;
};

AsapCalendarBookingButton.propTypes = {
    setBookingDuration: PropTypes.func.isRequired,
    hourCount: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
};

const AsapCalendar = (props) => {

    const {today, setBookingBegin, setBookingEnd, submitRef} = props;

    const [allowedBookings, setAllowedBookings] = React.useState(null);

    const pushToAllowedBookings = (hourCount, newAllowedBookings) => {
        if (hourCount === 1) {
            newAllowedBookings.push(
                <AsapCalendarBookingButton setBookingDuration={setBookingDuration} hourCount={1}
                                           text="1 Stunde"/>);
        } else if (hourCount === 24) {
            newAllowedBookings.push(
                <AsapCalendarBookingButton setBookingDuration={setBookingDuration} hourCount={24}
                                           text="1 Tag"/>);
        } else {
            newAllowedBookings.push(
                <AsapCalendarBookingButton setBookingDuration={setBookingDuration} hourCount={hourCount}
                                           text={hourCount + ' Stunden'}/>);
        }
        return newAllowedBookings;
    };

    React.useEffect(() => {
        let newAllowedBookings = [];
        let found = false;
        for (const booking of props.bookings) {
            const comparisonWithBegin = compareDateWithoutTime(booking.begin, today);
            if (comparisonWithBegin === 0 && (found === false || newAllowedBookings.length > 0)) {
                if (booking.begin.toUTCString() === today.toUTCString() || (booking.begin < today && booking.end >= today)) {
                    found = true;
                    newAllowedBookings = [];
                    continue;
                }
                if (booking.begin > today) {
                    found = true;
                    const hourDiff = Math.abs(booking.begin - today) / 3600000;
                    let c = 1;
                    while (c <= 3 && hourDiff >= c) {
                        newAllowedBookings = pushToAllowedBookings(c, newAllowedBookings);
                        c++;
                    }
                }
            } else if (comparisonWithBegin === -1) {
                if (booking.end >= today) {
                    found = true;
                    newAllowedBookings = [];
                }
            }
        }
        if (!found) {
            const bookingTimes = [1, 2, 3, 24];
            for (const bookingTime of bookingTimes) {
                pushToAllowedBookings(bookingTime, newAllowedBookings);
            }
        }
        setAllowedBookings(newAllowedBookings);
    }, [props.bookings]);

    const setBookingDuration = (duration) => {
        let updatedToday = new Date();
        setBookingBegin(updatedToday);
        setBookingEnd(new Date(updatedToday.getFullYear(), updatedToday.getMonth(), updatedToday.getDate(), updatedToday.getHours() + duration, updatedToday.getMinutes()));
        if (submitRef.current) {
            submitRef.current.scrollIntoView();
        }
    };

    if (allowedBookings && allowedBookings.length > 0) {
        return <React.Fragment>
            <h3>Jetzt buchen für..</h3>
            {allowedBookings.map((AllowedBooking, index) => {
                return <React.Fragment key={index}>{AllowedBooking}</React.Fragment>;
            })}
        </React.Fragment>;
    }
    return <React.Fragment>
        <h3>Eine sofortige Buchung ist derzeit nicht möglich</h3>
        <p>Es existiert für den aktuellen Zeitpunkt bereits eine Buchung.<br/>
            Sie haben dennoch die Möglichkeit, einen späteren Startzeitpunkt auszuwählen.<br/>
            Dies können Sie entweder über das Formular unten oder mithilfe der Monatsansicht erledigen.
        </p>
    </React.Fragment>;
};

AsapCalendar.propTypes = {
    today: PropTypes.object.isRequired,
    setBookingBegin: PropTypes.func.isRequired,
    setBookingEnd: PropTypes.func.isRequired,
    submitRef: PropTypes.object.isRequired,
    bookings: PropTypes.arrayOf(PropTypes.shape(convertedBookingPropTypes)).isRequired,
    longestAllowedBooking: PropTypes.number,
};

export default AsapCalendar;
