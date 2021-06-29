import React from 'react';
import PropTypes from 'prop-types';

const PrevNextThingie = (props) => {
    return <span className='calendar-prev-next-thingie'>
        <button className="button calendar-stepper-button" type="button" onClick={props.handlePrev}>‹</button>
        {props.children}
        <button className="button calendar-stepper-button" type="button" onClick={props.handleNext}>›</button>
    </span>;
};

PrevNextThingie.propTypes = {
    children: PropTypes.element.isRequired,
    handlePrev: PropTypes.func.isRequired,
    handleNext: PropTypes.func.isRequired
}

const CalendarDateTimeStepper = (props) => {
    let timeDisplay = props.current.toLocaleString('de-DE', {timeStyle: 'short'});
    if (timeDisplay === '23:59') {
        timeDisplay = '24:00';
    }

    return <div className="calendar-stepper-container">
        <PrevNextThingie handlePrev={props.handlePreviousDate} handleNext={props.handleNextDate}>
            <span>{props.current.toLocaleString('de-DE', {dateStyle: 'short'})}</span>
        </PrevNextThingie>
        <PrevNextThingie handlePrev={props.handlePreviousTime} handleNext={props.handleNextTime}>
            <span>{timeDisplay} Uhr</span>
        </PrevNextThingie>
    </div>;
};

CalendarDateTimeStepper.propTypes = {
    current: PropTypes.object.isRequired,
    handleNextDate: PropTypes.func.isRequired,
    handlePreviousDate: PropTypes.func.isRequired,
    handleNextTime: PropTypes.func.isRequired,
    handlePreviousTime: PropTypes.func.isRequired,
};

export default CalendarDateTimeStepper;
