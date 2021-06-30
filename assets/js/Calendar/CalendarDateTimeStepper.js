import React from 'react';
import PropTypes from 'prop-types';

const PrevNextThingie = (props) => {
    return <span className="calendar-prev-next-thingie">
        <button aria-label={props.previousLabel}
                className="button calendar-stepper-button"
                type="button"
                onClick={props.previousDisabled ? undefined : props.handlePrev}
                disabled={props.previousDisabled}>‹</button>
        {props.children}
        <button aria-label={props.nextLabel} className="button calendar-stepper-button" type="button"
                onClick={props.handleNext}>›</button>
    </span>;
};

PrevNextThingie.propTypes = {
    children: PropTypes.element.isRequired,
    handlePrev: PropTypes.func.isRequired,
    handleNext: PropTypes.func.isRequired,
    previousLabel: PropTypes.string.isRequired,
    nextLabel: PropTypes.string.isRequired,
    previousDisabled: PropTypes.bool,
};

const CalendarDateTimeStepper = (props) => {
    let timeDisplay = props.current.toLocaleString('de-DE', {timeStyle: 'short'});
    if (timeDisplay === '23:59') {
        timeDisplay = '24:00';
    }

    return <div className="calendar-stepper-container">
        <PrevNextThingie handlePrev={props.handlePreviousDate} handleNext={props.handleNextDate}
                         previousLabel={'Einen Tag früher'} nextLabel={'Einen Tag später'}
                         previousDisabled={props.previousDateDisabled}>
            <span>{props.current.toLocaleString('de-DE', {dateStyle: 'short'})}</span>
        </PrevNextThingie>
        <PrevNextThingie handlePrev={props.handlePreviousTime} handleNext={props.handleNextTime}
                         previousDisabled={props.previousTimeDisabled}
                         previousLabel={'15 Minuten früher'} nextLabel={'15 Minuten später'}>
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
    previousDateDisabled: PropTypes.bool,
    previousTimeDisabled: PropTypes.bool,
};

export default CalendarDateTimeStepper;
