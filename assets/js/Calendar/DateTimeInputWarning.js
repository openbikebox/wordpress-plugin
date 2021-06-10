import PropTypes from 'prop-types';
import React from 'react';

const DateTimeInputWarning = (props) => {
    return <p className="calendar-date-input-warning">
        {props.show && <small>Bitte geben Sie eine Zahl zwischen {props.min} und {props.max} ein.</small>}
    </p>;
};

DateTimeInputWarning.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    show: PropTypes.bool.isRequired,
};

export default DateTimeInputWarning;
