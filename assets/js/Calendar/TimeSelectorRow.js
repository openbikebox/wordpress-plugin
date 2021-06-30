import React from 'react';
import PropTypes from 'prop-types';
import DateTimeInputWarning from './DateTimeInputWarning';
import {checkInRange} from './CalendarHelper';

const TimeSelectorRow = (props) => {

    const [hour, setHour] = React.useState(props.hour);
    const [minute, setMinute] = React.useState(props.minute);
    const [midnight, setMidnight] = React.useState(false);

    const [minMinute, setMinMinute] = React.useState(-1);
    const [maxMinute, setMaxMinute] = React.useState(61);
    const [hourValid, setHourValid] = React.useState(true);
    const [minuteValid, setMinuteValid] = React.useState(true);

    React.useEffect(() => {
        if (props.minute === 59 && props.hour === 23) {
            setHour(24);
            setMinute(0);
            setMidnight(true);
        } else {
            setMinute(props.minute);
            setHour(props.hour);
            setMidnight(false);
        }
        setMinMinute(getMinMinute(hour));
        setMaxMinute(getMaxMinute());
        setHourValid(true);
        setMinuteValid(true);
    }, [props.minute, props.hour]);

    React.useEffect(() => {
        setMaxMinute(getMaxMinute());
        setMinMinute(getMinMinute());
    }, [props.minHour, props.minMinute]);

    const getMinMinute = (checkHour = props.hour) => {
        if (props.minHour && checkHour === props.minHour) {
            return props.minMinute;
        }
        return -1;
    };

    const getMaxMinute = (checkHour = props.hour) => {
        if (props.maxHour && checkHour === props.maxHour) {
            return props.maxMinute ?? 59;
        }
        return 61;
    };

    const handleHourChange = (e) => {
        const newHour = e.target.value * 1;
        if (newHour === 24) {
            setMidnight(true);
            props.setHour(23);
            props.setMinute(59);
        } else {
            setMidnight(false);
            props.setHour(newHour);
        }
        setHour(newHour);
    };

    const handleMinuteChange = (e) => {
        const newMinute = e.target.value * 1;
        setMinute(newMinute);
        props.setMinute(newMinute);
    };

    return <div className="calendar-booking-time-row">
        <div className="calendar-booking-time-input">
            <label htmlFor={props.hourId}>Stunde</label>
            <select id={props.hourId} value={hour ?? undefined} onChange={handleHourChange}
                    className="calendar-numeric-input">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((hour) => {
                    if ((!props.minHour || hour >= props.minHour) && (!props.maxHour || hour <= props.maxHour))
                        return <option value={hour} key={props.hourId + hour}>{hour}</option>;
                })}
            </select>
            <DateTimeInputWarning min={props.minHour ?? 0} max={props.maxHour ?? 23} show={!hourValid}/>
        </div>
        <div className="calendar-booking-time-input">
            <label htmlFor={props.minuteId}>Minute</label>
            {midnight
                ? <select id={props.minuteId} value={minute ?? undefined} className="calendar-numeric-input">
                    <option value={0}>00</option>
                </select>
                : <select id={props.minuteId} onChange={handleMinuteChange} value={minute ?? undefined}
                          className="calendar-numeric-input">
                    {['00', '15', '30', '45'].map((minute) => {
                        return <option disabled={minute < minMinute || minute > maxMinute} key={props.minuteId + minute}
                                       value={minute * 1}>{minute}</option>;
                    })}
                </select>}
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
