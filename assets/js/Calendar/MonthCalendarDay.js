import React from 'react';
import PropTypes from 'prop-types';
import {calculateDateDiff, checkInDateRange, compareDateWithoutTime, compareMonthAndYear} from './CalendarHelper';
import {convertedBookingPropTypes} from './CalendarPropTypes';

const MonthCalendarDay = (props) => {
    const {date, bookings} = props;
    const [active, setActive] = React.useState();
    const [dragStated, setDragStarted] = React.useState(false);
    const [available, setAvailable] = React.useState(true);
    const [partial, setPartial] = React.useState(false);

    const ref = React.createRef();

    React.useEffect(() => {
        if (props.bookingBegin && props.bookingEnd) {
            setActive(checkInDateRange(props.bookingBegin, props.bookingEnd, date));
        } else {
            setActive(false);
        }
    }, [date, props.bookingBegin, props.bookingEnd]);

    React.useEffect(() => {
        for (const booking of bookings) {
            const beginComparison = compareDateWithoutTime(booking.begin, date);
            const endComparison = compareDateWithoutTime(booking.end, date);
            setAvailable(beginComparison > 0 || endComparison < 0);
            if (beginComparison === 0) {
                setPartial(true);
            } else if (endComparison === 0) {
                setPartial(true);
            } else {
                setPartial(false);
            }
        }
    }, [date, bookings]);

    const handleDayClick = () => {
        if (!props.disabled && available) {
            if (active) {
                if (compareDateWithoutTime(props.bookingBegin, props.bookingEnd) === 0) {
                    props.setBookingBegin(null);
                    props.setBookingEnd(null);
                    return;
                }
                const startCompare = calculateDateDiff(props.bookingBegin, date);
                if (startCompare === 0) {
                    props.setBookingBegin(props.bookingEnd);
                } else {
                    const endCompare = calculateDateDiff(date, props.bookingEnd);
                    if (endCompare === 0) {
                        props.setBookingEnd(props.bookingBegin);
                    } else {
                        if (startCompare >= endCompare) {
                            props.setBookingEnd(date);
                        } else {
                            props.setBookingBegin(date);
                        }
                    }
                }
            } else {
                if (!props.bookingBegin || compareDateWithoutTime(date, props.bookingBegin) < 0) {
                    props.setBookingBegin(date);
                }
                if (!props.bookingEnd || compareDateWithoutTime(date, props.bookingEnd) > 0) {
                    props.setBookingEnd(date);
                }
            }
        }
    };

    const handleMouseDown = () => {
        props.setDragging(true);
        setDragStarted(true);
    };

    const handleMouseUp = () => {
        setDragStarted(false);
    };

    const handleMouseLeave = () => {
        if (dragStated && props.dragging) {
            handleDayClick();
            setDragStarted(false);
        }
    };

    const handleDrag = () => {
        if (props.dragging) {
            handleDayClick();
            ref.current.focus();
        }
    };

    return <button className="calendar-date" onClick={handleDayClick}
                   aria-disabled={props.disabled || props.maxReached || !available}
                   aria-label={date.toLocaleDateString()}
                   data-partial={partial} data-active={active} aria-checked={active} role="checkbox"
                   onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
                   onMouseEnter={handleDrag} ref={ref}>
        {date.getDate()}
    </button>;
};

MonthCalendarDay.propTypes = {
    bookings: PropTypes.arrayOf(PropTypes.shape(convertedBookingPropTypes)).isRequired,
    disabled: PropTypes.bool.isRequired,
    date: PropTypes.object.isRequired,
    dragging: PropTypes.bool.isRequired,
    setDragging: PropTypes.func.isRequired,
    maxReached: PropTypes.bool.isRequired,
    bookingBegin: PropTypes.object,
    setBookingBegin: PropTypes.func.isRequired,
    bookingEnd: PropTypes.object,
    setBookingEnd: PropTypes.func.isRequired,
};

export default MonthCalendarDay;
