import React from 'react';
import PropTypes from 'prop-types';

const BookingModal = (props) => {
    const [allDay, setAllDay] = React.useState(false);

    return <div className="bookingModal">
        <h2>Neue Buchung am {props.date.toLocaleDateString('de-DE')}</h2>
        <form>

        </form>
    </div>;
};

BookingModal.propTypes = {
    date: PropTypes.object.isRequired,
    bookings: PropTypes.object.isRequired,
};
