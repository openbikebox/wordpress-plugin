import React from 'react';
import PropTypes from "prop-types";

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

export default CalendarDayTooltip;