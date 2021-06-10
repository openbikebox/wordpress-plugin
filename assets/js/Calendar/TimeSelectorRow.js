import React from 'react';
import PropTypes from 'prop-types';
import DateTimeInputWarning from './DateTimeInputWarning';
import {checkInRange} from './CalendarHelper';

const TimeSelectorRow = (props) => {

    const [hour, setHour] = React.useState(props.hour);
    const [minute, setMinute] = React.useState(props.minute);

    const [hourValid, setHourValid] = React.useState(true);
    const [minuteValid, setMinuteValid] = React.useState(true);

    React.useEffect(() => {
        setHour(props.hour);
        setHourValid(true);
    }, [props.hour]);

    React.useEffect(() => {
        setMinute(props.minute);
        setMinuteValid(true);
    }, [props.minute]);

    const getMinMinute = (checkHour = props.hour) => {
        if (checkHour === props.minHour) {
            return props.minMinute;
        }
        return 0;
    };

    const getMaxMinute = (checkHour = props.hour) => {
        if (props.maxHour && checkHour === props.maxHour) {
            return props.maxMinute ?? 59;
        }
        return 59;
    };

    const handleHourChange = (e) => {
        const newHour = e.target.value * 1;
        if (checkInRange(newHour, e.target)) {
            props.setHour(newHour);
            setHourValid(true);
            if (minute < getMinMinute(newHour)) {
                setMinute(props.minMinute);
                props.setMinute(props.minMinute);
            }
            if (minute > getMaxMinute(newHour)) {
                setMinute(props.maxMinute);
                props.setMinute(props.maxMinute);
            }
            setMinuteValid(true);
            setHourValid(true);
        } else {
            setHourValid(false);
        }
        setHour(newHour);
    };

    const handleMinuteChange = (e) => {
        const newMinute = e.target.value * 1;
        if (checkInRange(newMinute, e.target)) {
            props.setMinute(newMinute);
            setMinuteValid(true);
        } else {
            setMinuteValid(false);
        }
        setMinute(newMinute);
    };

    return <div className='calendar-booking-time-row'>
        <div className='calendar-booking-time-input'>
            <label htmlFor={props.hourId}>Stunde</label>
            <input type="number" id={props.hourId} min={props.minHour ?? 0} max={props.maxHour ?? 23}
                   onChange={handleHourChange} value={hour ?? ''} className="calendar-numeric-input"/>
            <DateTimeInputWarning min={props.minHour ?? 0} max={props.maxHour ?? 23} show={!hourValid}/>
        </div>
        <div className='calendar-booking-time-input'>
            <label htmlFor={props.minuteId}>Minute</label>
            <input type="number" id={props.minuteId} min={getMinMinute()} max={getMaxMinute()}
                   onChange={handleMinuteChange} value={minute ?? ''} className="calendar-numeric-input"/>
            <DateTimeInputWarning min={getMinMinute()} max={getMaxMinute()} show={!minuteValid}/>
        </div>
    </div>;
};

TimeSelectorRow.propTypes = {
    hourId: PropTypes.string.isRequired,
    minuteId: PropTypes.string.isRequired,
    hour: PropTypes.number,
    setHour: PropTypes.func.isRequired,
    minute: PropTypes.number,
    setMinute: PropTypes.func.isRequired,
    minHour: PropTypes.number,
    minMinute: PropTypes.number,
    maxHour: PropTypes.number,
    maxMinute: PropTypes.number,
};

export default TimeSelectorRow;
