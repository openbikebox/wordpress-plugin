import React from 'react';
import PropTypes from 'prop-types';
import {calculateDateDiff, compareDateWithoutTime} from './CalendarHelper';

const CalendarDayTooltip = (props) => {
    const {available} = props;

    if (available.partial && available.bookings) {
        return <>
            <p className="calendar-date-dot">⚫</p>
            <div className="calendar-date-tooltip">
                <h4>An diesem Tag bestehen bereits folgende Buchungen:</h4>
                <ul>
                    {available.bookings.map((booking, index) => {
                        return <li key={index}>
                            {booking.begin ? booking.begin.toLocaleTimeString('de-DE', {
                                hour: '2-digit',
                                minute: '2-digit',
                            }) : 'Anfang des Tages'} -
                            {booking.end ? booking.end.toLocaleTimeString('de-DE', {
                                hour: '2-digit',
                                minute: '2-digit',
                            }) : 'Ende des Tages'}
                        </li>;
                    })}
                </ul>
            </div>
        </>;
    } else if (!available.available) {
        return <>
            <p className="calendar-date-dot">&nbsp;</p>
            <span className="calendar-date-tooltip">Dieser Tag ist leider ausgebucht.</span>
        </>;
    }
    return <p className="calendar-date-dot">&nbsp;</p>;
};

CalendarDayTooltip.propTypes = {
    available: PropTypes.object, //TODO: Shape
};

const MonthCalendarDay = (props) => {
        const {date, available, active} = props;
        const [dragStarted, setDragStarted] = React.useState(false);

        const ref = React.useRef(null);

        const toggleActiveOff = () => {
            if (compareDateWithoutTime(props.bookingBegin, props.bookingEnd) === 0) {
                props.setBookingBegin(null);
                props.setBookingEnd(null);
                return;
            }

            const startCompare = calculateDateDiff(props.bookingBegin, date);
            if (startCompare === 0) {
                props.setBookingBegin(props.bookingEnd);
                return;
            }

            const endCompare = calculateDateDiff(date, props.bookingEnd);
            if (endCompare === 0) {
                props.setBookingEnd(props.bookingBegin);
                return;
            }

            if (startCompare > endCompare) {
                props.setBookingEnd(date);
            } else if (startCompare < endCompare) {
                props.setBookingBegin(date);
            } else {
                props.lastSet === 'begin' ? props.setBookingBegin(date) : props.setBookingEnd(date);
            }
        };

        const toggleActiveOn = () => {
            if (!props.bookingBegin || compareDateWithoutTime(date, props.bookingBegin) < 0) {
                props.setBookingBegin(available.latest ?? date);
            }
            if (!props.bookingEnd || compareDateWithoutTime(date, props.bookingEnd) > 0) {
                props.setBookingEnd(available.earliest ?? date);
            }
        };

        const handleDayClick = () => {
            if (!props.disabled && available.available) {
                active.active ? toggleActiveOff() : toggleActiveOn();
            }
        };

        const handleMouseDown = () => {
            props.setDragging(true);
            setDragStarted(true);
        };

        const handleMouseUp = () => {
            setDragStarted(false);
        };

        const handleMouseEnter = (e) => {
            if (props.dragging) {
                handleDayClick();
                ref.current.focus();
            }
        };

        const handleMouseLeave = (e) => {
            if (dragStarted && props.dragging) {
                handleDayClick();
                setDragStarted(false);
            }
        };

        return <button className="calendar-date" onClick={handleDayClick} data-available={available.available}
                       aria-disabled={props.disabled || props.maxReached || !available.available}
                       aria-label={date.toLocaleDateString()} data-part-available={props.available.partial}
                       data-active={active.active} data-disabled={props.disabled}
                       aria-checked={active.active} role="checkbox" data-part-active={active.partial}
                       onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
                       onMouseEnter={handleMouseEnter} ref={ref} data-today={props.isToday}>
            <span>{date.getDate()}</span>
            {!props.disabled && <CalendarDayTooltip available={available}/> || <p className="calendar-date-dot">&nbsp;</p>}
        </button>;
    }
;

MonthCalendarDay.propTypes = {
    active: PropTypes.object.isRequired, // TODO: shape
    available: PropTypes.object.isRequired, // TODO: shape
    disabled: PropTypes.bool.isRequired,
    isToday: PropTypes.bool.isRequired,
    setDragging: PropTypes.func.isRequired,
    dragging: PropTypes.bool.isRequired,
    bookingBegin: PropTypes.object,
    bookingEnd: PropTypes.object,
    setBookingBegin: PropTypes.func.isRequired,
    setBookingEnd: PropTypes.func.isRequired,
};

export default MonthCalendarDay;
