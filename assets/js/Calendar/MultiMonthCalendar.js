import React from 'react';
import MonthCalendar, {monthCalendarPropTypes} from './MonthCalendar';
import {compareMonthAndYear} from './CalendarHelper';

const MultiMonthCalendar = (props) => {
    const {today} = props;

    const [current, setCurrent] = React.useState(props.initialCurrent ?? new Date());
    const [present, setPresent] = React.useState(compareMonthAndYear(current, today));

    const handleMonthSwitch = (back) => {
        let newCurrent;
        if (back) {
            newCurrent = new Date(current.getFullYear(), current.getMonth(), 0);
        } else {
            newCurrent = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }
        if (newCurrent.getMonth() === today.getMonth()) {
            newCurrent.setDate(today.getDate());
            setPresent(0);
        } else {
            setPresent(compareMonthAndYear(newCurrent, today));
        }
        setCurrent(newCurrent);
    };

    const Months = [];
    let month = current;
    for (let c = 0; c < props.monthCount; c++) {
        Months.push(<MonthCalendar handleMonthSwitch={handleMonthSwitch} bookings={props.bookings}
                                   bookingBegin={props.bookingBegin} bookingEnd={props.bookingEnd}
                                   allowPast={props.allowPast} maxReached={props.maxReached} initialCurrent={month}
                                   today={today} unavailableDates={props.unavailableDates}
                                   disableBack={!props.allowPast && present < 1} setBookingBegin={props.setBookingBegin}
                                   setBookingEnd={props.setBookingEnd} lastSet={props.lastSet} setBookingBeginAndEnd={props.setBookingBeginAndEnd}
        />);
        month = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    }

    return <React.Fragment>
        {Months.map((Month, index) => <React.Fragment key={'multiMonthMonth' + index}>{Month}</React.Fragment>)}
    </React.Fragment>;
};

MultiMonthCalendar.propTypes = monthCalendarPropTypes;

export default MultiMonthCalendar;
