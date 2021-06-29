import React from 'react';
import PropTypes from 'prop-types';
import DateSelectorRow from './DateSelectorRow';
import TimeSelectorRow from './TimeSelectorRow';
import {compareDateWithoutTime, dateTimeFormatOptions, getEndOfDate, getStartOfDate} from './CalendarHelper';
import {pricegroupPropTypes} from '../Models';
import PriceDisplay from '../PriceDisplay';
import {getResourcePrice} from '../Api';

const BookingForm = (props) => {
    const [tempBookingBegin, setTempBookingBegin] = React.useState();
    const [tempBookingEnd, setTempBookingEnd] = React.useState();
    const [beginHour, _setBeginHour] = React.useState(null);
    const [beginMinute, _setBeginMinute] = React.useState(null);
    const [endHour, _setEndHour] = React.useState(null);
    const [endMinute, _setEndMinute] = React.useState(null);
    const [beginSame, setBeginSame] = React.useState(false);
    const [endSame, setEndSame] = React.useState(false);
    const [editingBegin, setEditingBegin] = React.useState(false);
    const [editingEnd, setEditingEnd] = React.useState(false);
    const [price, setPrice] = React.useState(null);

    const updateBeginAndEndSame = () => {
        if (props.bookingBegin) {
            setBeginSame(compareDateWithoutTime(props.bookingBegin, props.today) === 0);
        } else {
            setBeginSame(false);
        }
        if (props.bookingEnd) {
            setEndSame(compareDateWithoutTime(props.bookingEnd, props.bookingBegin) === 0);
        } else {
            setEndSame(false);
        }
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
            if (props.bookingEnd && tempBookingBegin > props.bookingEnd) {
                props.setBookingBeginAndEnd(tempBookingBegin, getEndOfDate(tempBookingBegin));
            } else {
                props.setBookingBegin(new Date(tempBookingBegin.getFullYear(), tempBookingBegin.getMonth(), tempBookingBegin.getDate(), beginHour, beginMinute), false, true);
            }
        } else {
            props.setBookingBegin(null);
        }
        setEditingBegin(false);
    };

    const setBookingEnd = () => {
        if (tempBookingEnd) {
            if (props.bookingBegin && tempBookingEnd < props.bookingBegin) {
                props.setBookingBeginAndEnd(getStartOfDate(tempBookingEnd), tempBookingEnd);
            } else {
                props.setBookingEnd(new Date(tempBookingEnd.getFullYear(), tempBookingEnd.getMonth(), tempBookingEnd.getDate(), endHour, endMinute), true);
            }
        } else {
            props.setBookingEnd(null);
        }
        setEditingEnd(false);
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
        setTempBookingBegin(props.bookingBegin);
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
        setTempBookingEnd(props.bookingEnd);
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
                    <h4> Von: {props.bookingBegin && props.bookingBegin.toLocaleString('de-DE', dateTimeFormatOptions)}</h4>
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
                    <h4> Bis: {props.bookingEnd && props.bookingEnd.toLocaleString('de-DE', dateTimeFormatOptions)}</h4>
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
