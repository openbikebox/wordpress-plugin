import React from 'react';
import {ComponentStatus} from './Helpers';
import Calendar from './Calendar/Calendar';

const ResourceView = (props) => {
    const [status, setStatus] = React.useState(ComponentStatus.loading);
    const [resource, setResource] = React.useState(null);

    React.useEffect(() => {
        // TODO: fetch real data
        window.setTimeout(() => {
            setResource({
                identifier: 'Lastenrad',
                id_url: 'mockCargoBike.url',
                created: '2021-06-01T16:01:00',
                installed_at: '2021-06-01T16:01:00',
                modified: '2021-06-01T16:01:00',
                status: 'free',
                unavailable_until: null,
                description: 'A fairly cool cargo bike',
                pricegroup: {
                    id: 1,
                    created: '2021-06-01T16:00:00',
                    modified: '2021-06-01T16:00:00',
                    fee_hour: '0.2',
                    fee_day: '1',
                    fee_week: '6',
                    fee_month: '20',
                    fee_year: '300',
                },
            });
            setStatus(ComponentStatus.ready);

        }, 1000);
    }, []);

    if (status === ComponentStatus.loading) {
        return <p>Lade Informationen...</p>;
    } else if (status === ComponentStatus.error) {
        return <p>Beim Laden der Informationen ist ein serverseitiger Fehler aufgetreten. Bitte versuchen Sie es später
            erneut.</p>;
    }

    return <div>
        <h2>{resource.identifier}</h2>
        {resource.photo && <img src={resource.photo.url} alt={'Foto von ' + resource.identifier}/>}
        <p>{resource.description}</p>
        <Calendar handleSubmit={(e) => {
            // TODO: Actually submit
            e.preventDefault();
            alert('Not implemented');
        }} priceGroup={resource.pricegroup} bookings={[{begin: '2021-06-13T17:00:00', end: '2021-06-17T15:00:00'}, {
            begin: '2021-06-19T13:12:00',
            end: '2021-06-19T19:00:00',
        }]} maxBookingLength={604800} initialView={screen.width > 800 ? 'month' : 'asap'}/>
    </div>;
};

export default ResourceView;
