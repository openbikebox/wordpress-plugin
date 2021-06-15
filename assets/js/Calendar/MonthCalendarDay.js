import React from 'react';
import PropTypes from 'prop-types';
import {calculateDateDiff, checkInDateRange, compareDateWithoutTime, compareMonthAndYear} from './CalendarHelper';
import {convertedBookingPropTypes} from './CalendarPropTypes';

const MonthCalendarDay = (props) => {
    const {date, bookings} = props;
    const [active, setActive] = React.useState();
    const [dragStated, setDragStarted] = React.useState(false);
    const [available, setAvailable] = React.useState(true);
    const [partial, setPartial] = React.useState('false');
    const [partialTopTime, setPartialTopTime] = React.useState();
    const [partialBottomTime, setPartialBottomTime] = React.useState();
    const [partialActive, setPartialActive] = React.useState('');
    const [partialAvailable, setPartialAvailable] = React.useState('');

    const ref = React.createRef();

    const updatePartialActiveForSwitch = (newPartialActive, bottomTime) => {
        if (props.bookingEnd) {
            newPartialActive = bottomTime > props.bookingEnd.getHours() ? 'bottom' : 'top';
        }
        return newPartialActive;
    };

    React.useEffect(() => {
        let newPartialActive = '';
        if (props.bookingBegin && props.bookingEnd) {
            const newActive = checkInDateRange(props.bookingBegin, props.bookingEnd, date);
            setActive(newActive);
            if (newActive) {
                const beginComparison = compareDateWithoutTime(props.bookingBegin, date);
                const endComparison = compareDateWithoutTime(props.bookingEnd, date);
                if (beginComparison === 0 && props.bookingBegin.getHours() > 0) {
                    newPartialActive = 'bottom';
                }
                if (endComparison === 0 && props.bookingEnd.getHours() < 23) {
                    if (newPartialActive === 'bottom') {
                        newPartialActive = updatePartialActiveForSwitch('switch', partialBottomTime);
                    } else {
                        newPartialActive = 'top';
                    }
                }
            }
        } else {
            setActive(false);
        }
        setPartialActive(newPartialActive);
    }, [date, props.bookingBegin, props.bookingEnd]);

    React.useEffect(() => {
        for (const booking of bookings) {
            const beginComparison = compareDateWithoutTime(booking.begin, date);
            const endComparison = compareDateWithoutTime(booking.end, date);
            setAvailable(beginComparison > 0 || endComparison < 0);
            if (beginComparison <= 0 && endComparison >= 0) {
                let newPartialTopTime = null;
                let newPartialBottomTime = null;
                let newPartial = 'false';

                if (!props.disabled && beginComparison === 0) {
                    setAvailable(true);
                    newPartial = 'bottom';
                    if (!partialBottomTime || partialBottomTime < booking.begin) {
                        newPartialBottomTime = booking.end;
                    }
                }
                if (!props.disabled && endComparison === 0 && booking.end.getHours() < 23) {
                    if (newPartial === 'bottom') {
                        newPartial = 'switch';
                        if (active && props.bookingEnd) {
                            setPartialActive(updatePartialActiveForSwitch(partialActive, newPartialBottomTime));
                        }
                    } else {
                        newPartial = 'top';
                    }
                    setAvailable(true);
                    newPartialTopTime = booking.end;
                    if (!partialTopTime || partialTopTime > booking.end) {
                        newPartialTopTime = booking.begin;
                    }
                }
                setPartialTopTime(newPartialTopTime);
                setPartialBottomTime(newPartialBottomTime);
                setPartial(newPartial);
                break;
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
                    props.setBookingBegin(partialTopTime ?? date);
                }
                if (!props.bookingEnd || compareDateWithoutTime(date, props.bookingEnd) > 0) {
                    props.setBookingEnd(partialBottomTime ?? date);
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

    return <button className="calendar-date" onClick={handleDayClick} data-available={available}
                   aria-disabled={props.disabled || props.maxReached || !available}
                   aria-label={date.toLocaleDateString()} data-part-available={partialAvailable}
                   data-partial={!partialTopTime || !partialBottomTime ? partial : 'switch'} data-active={active}
                   aria-checked={active} role="checkbox" data-part-active={partialActive}
                   onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
                   onMouseEnter={handleDrag} ref={ref}>
        <span>{date.getDate()}</span>
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
