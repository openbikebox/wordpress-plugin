import React from 'react';
import PropTypes from 'prop-types';
import DateSelectorRow from './DateSelectorRow';
import TimeSelectorRow from './TimeSelectorRow';
import {compareDateWithoutTime, dateTimeFormatOptions, getEndOfDate, getStartOfDate} from './CalendarHelper';
import {pricegroupPropTypes} from '../Models';
import PriceDisplay from '../PriceDisplay';
import {getResourcePrice} from '../Api';
import CalendarDateTimeStepper from './CalendarDateTimeStepper';

const BookingForm = (props) => {
    const [tempBookingBegin, _setTempBookingBegin] = React.useState();
    const [tempBookingEnd, _setTempBookingEnd] = React.useState();
    const [beginHour, _setBeginHour] = React.useState(null);
    const [beginMinute, _setBeginMinute] = React.useState(null);
    const [endHour, _setEndHour] = React.useState(null);
    const [endMinute, _setEndMinute] = React.useState(null);
    const [beginSame, _setBeginSame] = React.useState(false);
    const [endSame, _setEndSame] = React.useState(false);
    const [beginPreviousTimeStepperDisabled, setBeginPreviousTimeStepperDisabled] = React.useState(false);
    const [endPreviousTimeStepperDisabled, setEndPreviousTimeStepperDisabled] = React.useState(false);
    const [editingBegin, setEditingBegin] = React.useState(false);
    const [editingEnd, setEditingEnd] = React.useState(false);
    const [price, setPrice] = React.useState(null);

    const setBeginSame = (newBeginSame, begin = props.bookingBegin) => {
        _setBeginSame(newBeginSame);
        setBeginPreviousTimeStepperDisabled(newBeginSame && props.today.getHours() === begin.getHours() && props.today.getMinutes() >= begin.getMinutes());
    };

    const setEndSame = (newEndSame, newBeginSame = beginSame, begin = props.bookingBegin, end = props.bookingEnd) => {
        _setEndSame(newEndSame);
        setEndPreviousTimeStepperDisabled(newBeginSame && newEndSame && begin.getHours() === end.getHours() && begin.getMinutes() >= end.getMinutes());
    };

    const setTempBookingBegin = (newTempBookingBegin, skipSameCheck = false) => {
        if (!skipSameCheck)
            updateBeginAndEndSame(tempBookingBegin, tempBookingEnd ?? props.bookingEnd);
        _setTempBookingBegin(newTempBookingBegin);
    };

    const setTempBookingEnd = (newTempBookingEnd, skipSameCheck = false) => {
        if (!skipSameCheck)
            updateBeginAndEndSame(tempBookingBegin ?? props.bookingBegin, newTempBookingEnd);
        _setTempBookingEnd(newTempBookingEnd);
    };

    const updateBeginAndEndSame = (begin = props.bookingBegin, end = props.bookingEnd) => {
        const newBeginSame = begin && compareDateWithoutTime(begin, props.today) === 0;
        const newEndSame = begin && end && compareDateWithoutTime(end, begin) === 0;
        setBeginSame(newBeginSame, begin);
        setEndSame(newEndSame, newBeginSame, begin, end);
    };

    const setBeginAndEndSame = (to) => {
        setBeginSame(to);
        setEndSame(to);
    };

    const setBeginMinute = (newBeginMinute) => {
        _setBeginMinute(newBeginMinute);
        if (tempBookingBegin) {
            setTempBookingBegin(new Date(tempBookingBegin.getFullYear(), tempBookingBegin.getMonth(), tempBookingBegin.getDate(), beginHour ?? 0, newBeginMinute));
        } else if (props.bookingBegin) {
            setTempBookingBegin(new Date(props.bookingBegin.getFullYear(), props.bookingBegin.getMonth(), props.bookingBegin.getDate(), beginHour ?? 0, newBeginMinute ?? 0));
        }
    };

    const setBeginHour = (newBeginHour) => {
        _setBeginHour(newBeginHour);
        if (tempBookingBegin) {
            setTempBookingBegin(new Date(tempBookingBegin.getFullYear(), tempBookingBegin.getMonth(), tempBookingBegin.getDate(), newBeginHour, beginMinute ?? 0));
        } else if (props.bookingBegin) {
            setTempBookingBegin(new Date(props.bookingBegin.getFullYear(), props.bookingBegin.getMonth(), props.bookingBegin.getDate(), newBeginHour, beginMinute ?? 0));
        }
    };

    const setEndMinute = (newEndMinute) => {
        _setEndMinute(newEndMinute);
        if (tempBookingEnd) {
            setTempBookingEnd(new Date(tempBookingEnd.getFullYear(), tempBookingEnd.getMonth(), tempBookingEnd.getDate(), endHour ?? 0, newEndMinute));
        } else if (props.bookingEnd) {
            setTempBookingEnd(new Date(props.bookingEnd.getFullYear(), props.bookingEnd.getMonth(), props.bookingEnd.getDate(), newEndHour ?? 0, newEndMinute));
        }
    };

    const setEndHour = (newEndHour) => {
        _setEndHour(newEndHour);
        if (tempBookingEnd) {
            setTempBookingEnd(new Date(tempBookingEnd.getFullYear(), tempBookingEnd.getMonth(), tempBookingEnd.getDate(), newEndHour, endMinute ?? 0));
        } else if (props.bookingEnd) {
            setTempBookingEnd(new Date(props.bookingEnd.getFullYear(), props.bookingEnd.getMonth(), props.bookingEnd.getDate(), newEndHour, endMinute ?? 0));
        }
    };

    const setBookingBegin = () => {
        if (tempBookingBegin) {
            updateBegin(new Date(tempBookingBegin.getFullYear(), tempBookingBegin.getMonth(), tempBookingBegin.getDate(), beginHour, beginMinute));
        } else {
            props.setBookingBegin(null);
        }
        setEditingBegin(false);
    };

    const setBookingEnd = () => {
        if (tempBookingEnd) {
            updateEnd(new Date(tempBookingEnd.getFullYear(), tempBookingEnd.getMonth(), tempBookingEnd.getDate(), endHour, endMinute));
        } else {
            props.setBookingEnd(null);
        }
        setEditingEnd(false);
    };

    const updateBegin = (newBegin) => {
        if (props.bookingEnd && newBegin > props.bookingEnd) {
            props.setBookingBeginAndEnd(newBegin, getEndOfDate(newBegin));
        } else if (newBegin < props.today) {
            props.setBookingBegin(props.today, false, true);
        } else {
            props.setBookingBegin(newBegin, false, true);
        }
    };

    const updateEnd = (newEnd, timeSet = false) => {
        if (props.bookingBegin && newEnd < props.bookingBegin) {
            if (timeSet) {
                props.setBookingEnd(props.bookingBegin);
            } else if (getStartOfDate(newEnd) < props.today) {
                props.setBookingBeginAndEnd(new Date(), getEndOfDate(props.today));
            } else {
                props.setBookingBeginAndEnd(getStartOfDate(newEnd), newEnd);
            }
        } else {
            if (newEnd.getHours() === 0 && newEnd.getMinutes() === 0) {
                // Only book until 23:59 instead of 00:00
                newEnd.setMinutes(-1);
            }
            props.setBookingEnd(newEnd, true);
        }
    };

    const normalizeTo15Minutes = (minutes, direction) => {
        if (minutes === 59) {
            // Treat 59 minutes as a full hour
            minutes++;
        }

        let newMinutes = minutes + (direction * 15);
        const diffTo15 = newMinutes % 15;
        if (diffTo15 > 0) {
            newMinutes += diffTo15 * direction;
        }
        return newMinutes;
    };

    // Add or subtract a day from booking begin
    const handleBeginDateStep = (direction) => {
        updateBegin(new Date(props.bookingBegin.getTime() + (direction * 8.64e+7)));
    };

    // Add or subtract 15 minutes from booking begin
    const handleBeginTimeStep = (direction) => {
        let newMinutes = normalizeTo15Minutes(props.bookingBegin.getMinutes(), direction);
        const newBegin = new Date(props.bookingBegin);
        newBegin.setMinutes(newMinutes);
        updateBegin(newBegin);
    };

    const handleEndDateStep = (direction) => {
        updateEnd(new Date(props.bookingEnd.getTime() + (direction * 8.64e+7)));
    };

    const handleEndTimeStep = (direction) => {
        let newMinutes = normalizeTo15Minutes(props.bookingEnd.getMinutes(), direction);
        const newEnd = new Date(props.bookingEnd);
        newEnd.setMinutes(newMinutes);
        updateEnd(newEnd, true);
    };

    React.useEffect(() => {
        if (props.bookingBegin) {
            _setBeginMinute(props.bookingBegin.getMinutes());
            _setBeginHour(props.bookingBegin.getHours());
            updateBeginAndEndSame();
        } else {
            _setBeginMinute(null);
            _setBeginHour(null);
            setBeginAndEndSame(false);
        }
        setTempBookingBegin(props.bookingBegin, true);
    }, [props.bookingBegin]);

    React.useEffect(() => {
        if (props.bookingEnd) {
            _setEndMinute(props.bookingEnd.getMinutes());
            _setEndHour(props.bookingEnd.getHours());
            updateBeginAndEndSame();
        } else {
            _setEndMinute(null);
            _setEndHour(null);
            setBeginAndEndSame(false);
        }
        setTempBookingEnd(props.bookingEnd, true);
    }, [props.bookingEnd]);

    React.useEffect(() => {
        if (props.bookingBegin && props.bookingEnd) {
            getResourcePrice(props.apiBackend, props.resource.id, props.bookingBegin.toISOString().substr(0, 19), props.bookingEnd.toISOString().substr(0, 19))
                .then(data => {
                    setPrice(data.data.value_gross);
                });

        } else {
            setPrice(null);
        }
    }, [props.bookingBegin, props.bookingEnd]);

    return <form onSubmit={props.handleSubmit} ref={props.submitRef}>
        <h3>Buchung</h3>
        <div className={'calendar-booking-container'}>
            {editingBegin || !props.bookingBegin
                ? <>
                    <h4>Von</h4>
                    <DateSelectorRow
                        setDate={setTempBookingBegin}
                        yearId={'calendar-booking-begin-year-input'}
                        monthId={'calendar-booking-begin-month-input'}
                        date={tempBookingBegin}
                        minDate={props.today}
                        dayId={'calendar-booking-begin-day-input'}
                    />
                    <TimeSelectorRow
                        hourId={'calendar-booking-begin-hour-input'}
                        minuteId={'calendar-booking-begin-minute-input'}
                        minHour={beginSame ? props.today.getHours() : 0}
                        setHour={setBeginHour}
                        hour={beginHour}
                        minMinute={beginSame ? props.today.getMinutes() : 0}
                        setMinute={setBeginMinute}
                        minute={beginMinute}
                    />
                    <button className="button calendar-change-time-button" onClick={setBookingBegin}>
                        Startzeitpunkt festlegen
                    </button>
                </>
                : <>
                    <h4>Von:</h4>
                    <CalendarDateTimeStepper current={props.bookingBegin}
                                             previousDateDisabled={beginSame}
                                             previousTimeDisabled={beginPreviousTimeStepperDisabled}
                                             handleNextDate={() => {
                                                 handleBeginDateStep(1);
                                             }}
                                             handlePreviousDate={() => {
                                                 handleBeginDateStep(-1);
                                             }}
                                             handleNextTime={() => {
                                                 handleBeginTimeStep(1);
                                             }}
                                             handlePreviousTime={() => {
                                                 handleBeginTimeStep(-1);
                                             }}/>
                    <button className="button calendar-change-time-button" onClick={() => setEditingBegin(true)}>
                        Startzeitpunkt {props.bookingBegin ? 'ändern' : 'festlegen'}
                    </button>
                </>}

            {editingEnd || !props.bookingEnd
                ? <>
                    <h4>Bis</h4>
                    <DateSelectorRow setDate={setTempBookingEnd} yearId={'calendar-booking-end-year-input'}
                                     monthId={'calendar-booking-end-month-input'} date={tempBookingEnd}
                                     minDate={props.bookingBegin ?? undefined}
                                     dayId={'calendar-booking-end-day-input'}/>
                    <TimeSelectorRow hourId={'calendar-booking-end-hour-input'}
                                     minuteId={'calendar-booking-end-minute-input'}
                                     minHour={endSame ? beginHour : 0} hour={endHour} setHour={setEndHour}
                                     minMinute={endSame ? beginMinute : 0} minute={endMinute} setMinute={setEndMinute}/>
                    <button className="button calendar-change-time-button" onClick={setBookingEnd}>Endzeitpunkt
                        festlegen
                    </button>
                </>
                : <>
                    <h4>Bis:</h4>
                    <CalendarDateTimeStepper current={props.bookingEnd}
                                             previousDateDisabled={endSame}
                                             previousTimeDisabled={endPreviousTimeStepperDisabled}
                                             handleNextDate={() => {
                                                 handleEndDateStep(1);
                                             }}
                                             handlePreviousDate={() => {
                                                 handleEndDateStep(-1);
                                             }}
                                             handleNextTime={() => {
                                                 handleEndTimeStep(1);
                                             }}
                                             handlePreviousTime={() => {
                                                 handleEndTimeStep(-1);
                                             }}/>
                    <button className="button calendar-change-time-button"
                            onClick={() => setEditingEnd(true)}>Endzeitpunkt {props.bookingEnd ? 'ändern' : 'festlegen'}</button>
                </>}
        </div>
        <button type="submit" className="button is-success calendar-submit-button"
                disabled={!props.bookingBegin || !props.bookingEnd}>
            Jetzt {!!price && <>für <PriceDisplay amount={price}/> </>} buchen!
        </button>
    </form>;
};

BookingForm.propTypes = {
    bookingBegin: PropTypes.object,
    setBookingBegin: PropTypes.func.isRequired,
    bookingEnd: PropTypes.object,
    setBookingEnd: PropTypes.func.isRequired,
    setBookingBeginAndEnd: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitRef: PropTypes.object.isRequired,
    priceGroup: PropTypes.shape(pricegroupPropTypes).isRequired,
    apiBackend: PropTypes.string,
};

export default BookingForm;
