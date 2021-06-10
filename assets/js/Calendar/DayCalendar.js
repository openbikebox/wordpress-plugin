import React from 'react';
import PropTypes from 'prop-types';

const DayCalendar = (props) => {
    //TODO: everything

    return <div className="day-calendar">
        Diese Ansicht wurde leider noch nicht implementiert.
    </div>;
};

DayCalendar.propTypes = {
    bookings: PropTypes.array.isRequired,
    initialCurrent: PropTypes.object,
};

export default DayCalendar;
