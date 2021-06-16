import React from 'react';
import PropTypes from 'prop-types';
import {calculateDateDiff, compareDateWithoutTime} from './CalendarHelper';

const CalendarDayTooltip = (props) => {
    const {available, whichTime} = props;

    if (!available.available) {
        return <>
            <p className="calendar-date-dot">&nbsp;</p>
            <span className="calendar-date-tooltip">Dieser Tag ist leider ausgebucht.</span>
        </>;
    } else {
        return <>
            <p className="calendar-date-dot">
                {available.partial && available.bookings ? <>⚫</> : <>&nbsp;</>}
            </p>
            <div className="calendar-date-tooltip">
                {!props.hideAction && <>
                    {whichTime[0] === 'Delete'
                        ? <p>Auswahl löschen</p>
                        : <p>{whichTime[0]}zeitpunkt
                            {whichTime[1]
                                ? <> entfernen</>
                                : <> setzen</>}
                        </p>}
                </>}
                {available.partial && available.bookings && <>
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
                </>}

            </div>
        </>;
    }
};

CalendarDayTooltip.propTypes = {
    available: PropTypes.object.isRequired, //TODO: Shape
    whichTime: PropTypes.array.isRequired,
    hideAction: PropTypes.bool.isRequired,
};

const MonthCalendarDay = (props) => {
    const {date, available, active} = props;
    const [dragStarted, setDragStarted] = React.useState(false);
    const [startOrEnd, setStartOrEnd] = React.useState(['Start', false]);
    const [hideAction, setHideAction] = React.useState(false);

    React.useEffect(() => {
        setStartOrEnd(checkSetsStartOrEnd());
    }, [props.bookingBegin, props.bookingEnd]);

    const ref = React.useRef(null);

    const checkSetsStartOrEnd = () => {
        if (!props.bookingBegin) {
            return ['Start', false];
        }

        if (!props.bookingEnd) {
            return ['End', false];
        }

        if (compareDateWithoutTime(props.bookingBegin, props.bookingEnd) === 0 && active.active) {
            return ['Delete', null];
        }

        const startCompare = calculateDateDiff(props.bookingBegin, date);

        if (startCompare === 0) {
            return ['Start', true];
        }

        const endCompare = calculateDateDiff(date, props.bookingEnd);
        if (endCompare === 0) {
            return ['End', true];
        }

        if (startCompare > endCompare) {
            return ['End', false];
        } else if (startCompare < endCompare) {
            return ['Start', false];
        } else {
            return [props.lastSet === 'begin' ? 'Start' : 'End', false];
        }
    };

    const toggleActiveOff = () => {
        if (startOrEnd[0] === 'Delete') {
            props.setBookingBegin(null);
            props.setBookingEnd(null);
        } else if (startOrEnd[0] === 'Start') {
            if (startOrEnd[1]) {
                props.setBookingBegin(props.bookingEnd);
            } else {
                props.setBookingBegin(date);
            }
        } else {
            if (startOrEnd[1]) {
                props.setBookingEnd(props.bookingBegin);
            } else {
                props.setBookingEnd(date);
            }
        }
    };

    const toggleActiveOn = () => {
        let newBegin = props.bookingBegin;
        let newEnd = props.bookingEnd;

        if (!props.bookingBegin || compareDateWithoutTime(date, props.bookingBegin) < 0) {
            newBegin = available.last ?? date;
        }
        if (!props.bookingEnd || compareDateWithoutTime(date, props.bookingEnd) > 0) {
            if (available.earliest && newBegin > available.earliest) {
                newEnd = newBegin;
            } else {
                newEnd = available.earliest ?? date;
            }
        }

        if (newBegin !== props.bookingBegin && newEnd !== props.bookingEnd) {
            props.setBookingBeginAndEnd(newBegin, newEnd);
        } else if (newBegin !== props.bookingBegin) {
            props.setBookingBegin(newBegin);
        } else if (newEnd !== props.bookingEnd) {
            props.setBookingEnd(newEnd);
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
        setHideAction(false);
        if (props.dragging) {
            handleDayClick();
            ref.current.focus();
        }
    };

    const handleMouseLeave = (e) => {
        setHideAction(true);
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
                   onMouseEnter={handleMouseEnter} ref={ref} data-today={props.isToday} onFocus={() => setHideAction(false)}>
        <span>{date.getDate()}</span>
        {!props.disabled &&
        <CalendarDayTooltip available={available} whichTime={startOrEnd} hideAction={hideAction}/> ||
        <p className="calendar-date-dot">&nbsp;</p>}
    </button>;
};

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
    setBookingBeginAndEnd: PropTypes.func.isRequired,
};

export default MonthCalendarDay;
