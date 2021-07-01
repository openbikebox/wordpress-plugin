import React from 'react';
import PropTypes from 'prop-types';
import {ComponentStatus} from './Helpers';
import Calendar from 'binary-booking-calendar/dist/binaryBookingCalendar'
import {getResourceBySlug, getResourceActions, submitBooking, getResourcePrice} from './Api';

const ResourceView = (props) => {
    const [status, setStatus] = React.useState(ComponentStatus.loading);
    const [resource, setResource] = React.useState(null);
    const [existingBookings, setExistingBookings] = React.useState([]);

    React.useEffect(() => {
        const func = async () => {
            const fetchedResource = await getResourceBySlug(props.apiBackend, props.resourceSlug);
            if (fetchedResource && fetchedResource.data) {
                try {
                    setResource(fetchedResource.data);
                    const fetchedResourceActions = await getResourceActions(props.apiBackend, fetchedResource.data.id);
                    setExistingBookings(fetchedResourceActions.data);
                    setStatus(ComponentStatus.ready);
                } catch (e) {
                    console.error(e);
                    setStatus(ComponentStatus.error);
                }
            } else {
                setStatus(ComponentStatus.error);
            }
        };
        func().then();
    }, []);

    if (status === ComponentStatus.loading) {
        return <p>Lade Informationen...</p>;
    } else if (status === ComponentStatus.error) {
        return <p>
            Beim Laden der Informationen ist ein serverseitiger Fehler aufgetreten. Bitte versuchen Sie es später
            erneut.
        </p>;
    }

    const handleSubmit = (bookingBegin, bookingEnd) => {
        submitBooking({
            begin: bookingBegin.toISOString().substr(0, 19) + 'Z',
            end: bookingEnd.toISOString().substr(0, 19) + 'Z',
            location_id: resource.location_id,
            resource_id: resource.id,
        }).then(() => {
            window.location.href = wc_add_to_cart_params.cart_url;
        });
    };

    const getPrice = (bookingBegin, bookingEnd) => {
        return getResourcePrice(props.apiBackend, resource.id, bookingBegin.toISOString().substr(0, 19), bookingEnd.toISOString().substr(0, 19))
            .then(data => {
                return(data.data.value_gross);
            });
    }

    return <div>
        <h2>{resource.name}</h2>
        {resource.photo && <img src={resource.photo.url} alt={'Foto von ' + resource.name}/>}
        <p>{resource.description}</p>
        <Calendar
            apiBackend={props.apiBackend}
            handleSubmit={handleSubmit}
            bookings={existingBookings}
            maxBookingLength={604800}
            initialView={screen.width > 800 ? 'month' : 'asap'}
            getPrice={getPrice}
        />
    </div>;
};

ResourceView.propTypes = {
    resourceSlug: PropTypes.string,
    apiBackend: PropTypes.string,
};

export default ResourceView;
