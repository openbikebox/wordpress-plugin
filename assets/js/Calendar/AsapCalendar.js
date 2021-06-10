import React from 'react';
import PropTypes from 'prop-types';

const AsapCalendar = (props) => {
    // TODO: check availability before rendering

    const {today, setBookingBegin, setBookingEnd, submitRef} = props;

    const setBookingDuration = (duration) => {
        today.setMinutes(new Date().getMinutes())
        setBookingBegin(today);
        setBookingEnd(new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + duration, today.getMinutes()));
        submitRef.current.scrollIntoView();
    };

    return <React.Fragment>
        <h3>Jetzt buchen für..</h3>
        <button className="button calendar-asap-booking-button" onClick={() => setBookingDuration(1)}>1 Stunde</button>
        <button className="button calendar-asap-booking-button" onClick={() => setBookingDuration(3)}>3 Stunden</button>
        <button className="button calendar-asap-booking-button" onClick={() => setBookingDuration(24)}>1 Tag</button>
    </React.Fragment>;
};

AsapCalendar.propTypes = {
    today: PropTypes.object.isRequired,
    setBookingBegin: PropTypes.func.isRequired,
    setBookingEnd: PropTypes.func.isRequired,
    submitRef: PropTypes.object.isRequired,
    longestAllowedBooking: PropTypes.number,
};

export default AsapCalendar;
