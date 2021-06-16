import React from 'react';
import PropTypes from 'prop-types';
import DateSelectorRow from './DateSelectorRow';
import TimeSelectorRow from './TimeSelectorRow';
import {calculatePrice, compareDateWithoutTime} from './CalendarHelper';
import {pricegroupPropTypes} from '../Models';
import PriceDisplay from '../PriceDisplay';

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
        if (props.bookingBegin) {
            props.setBookingBegin(new Date(props.bookingBegin.getFullYear(), props.bookingBegin.getMonth(), props.bookingBegin.getDate(), beginHour, newBeginMinute));
        } else {
            _setBeginMinute(newBeginMinute);
        }
    };

    const setBeginHour = (newBeginHour) => {
        if (props.bookingBegin) {
            props.setBookingBegin(new Date(props.bookingBegin.getFullYear(), props.bookingBegin.getMonth(), props.bookingBegin.getDate(), newBeginHour, beginMinute));
        } else {
            _setBeginHour(newBeginHour);
        }
    };

    const setEndMinute = (newEndMinute) => {
        if (props.bookingEnd) {
            props.setBookingEnd(new Date(props.bookingEnd.getFullYear(), props.bookingEnd.getMonth(), props.bookingEnd.getDate(), endHour, newEndMinute));
        } else {
            _setEndMinute(newEndMinute);
        }
    };

    const setEndHour = (newEndHour) => {
        if (props.bookingEnd) {
            props.setBookingEnd(new Date(props.bookingEnd.getFullYear(), props.bookingEnd.getMonth(), props.bookingEnd.getDate(), newEndHour, endMinute));
        } else {
            _setEndHour(newEndHour);
        }
    };

    const setBookingBegin = () => {
        if (tempBookingBegin) {
            props.setBookingBegin(new Date(tempBookingBegin.getFullYear(), tempBookingBegin.getMonth(), tempBookingBegin.getDate(), beginHour, beginMinute));
        } else {
            props.setBookingBegin(null);
        }
        setEditingBegin(false);
    };

    const setBookingEnd = () => {
        if (tempBookingEnd) {
            props.setBookingEnd(new Date(tempBookingEnd.getFullYear(), tempBookingEnd.getMonth(), tempBookingEnd.getDate(), endHour, endMinute));
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
            setPrice(calculatePrice(props.priceGroup, props.bookingBegin, props.bookingEnd));
        }else {
            setPrice(null);
        }
    }, [props.bookingBegin, props.bookingEnd]);

    return <form onSubmit={props.submit} ref={props.submitRef}>
        <h3>Buchung</h3>
        <div className={'calendar-booking-container'}>
            {editingBegin
                ? <>
                    <h4>Von</h4>
                    <DateSelectorRow setDate={setTempBookingBegin} yearId={'calendar-booking-begin-year-input'}
                                     monthId={'calendar-booking-begin-month-input'} date={tempBookingBegin}
                                     minDate={props.today} dayId={'calendar-booking-begin-day-input'}/>
                    <TimeSelectorRow hourId={'calendar-booking-begin-hour-input'}
                                     minuteId={'calendar-booking-begin-minute-input'}
                                     minHour={beginSame ? props.today.getHours() : 0} setHour={setBeginHour}
                                     hour={beginHour}
                                     minMinute={beginSame ? props.today.getMinutes() : 0} setMinute={setBeginMinute}
                                     minute={beginMinute}/>
                    <button className="button calendar-change-time-button" onClick={setBookingBegin}>Startzeitpunkt
                        festlegen
                    </button>
                </>
                : <>
                    <h4> Von: {props.bookingBegin && props.bookingBegin.toLocaleString('de-DE')}</h4>
                    <button className="button calendar-change-time-button"
                            onClick={() => setEditingBegin(true)}>Startzeitpunkt {props.bookingBegin ? 'ändern' : 'festlegen'}</button>
                </>}

            {editingEnd
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
                    <h4> Bis: {props.bookingEnd && props.bookingEnd.toLocaleString('de-DE')}</h4>
                    <button className="button calendar-change-time-button"
                            onClick={() => setEditingEnd(true)}>Endzeitpunkt {props.bookingEnd ? 'ändern' : 'festlegen'}</button>
                </>}
        </div>
        <button type="submit" className="button is-success calendar-submit-button" disabled={!props.bookingBegin || !props.bookingEnd}>
            Jetzt {!!price && <>für <PriceDisplay amount={price}/> </>} buchen!
        </button>
    </form>;
};

BookingForm.propTypes = {
    bookingBegin: PropTypes.object,
    setBookingBegin: PropTypes.func.isRequired,
    bookingEnd: PropTypes.object,
    setBookingEnd: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    submitRef: PropTypes.object.isRequired,
    priceGroup: PropTypes.shape(pricegroupPropTypes).isRequired,
};

export default BookingForm;
