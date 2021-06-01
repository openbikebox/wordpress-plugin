import React from 'react';
import PropTypes from 'prop-types';
import {formatPrice} from './Format';
import ResourceSvg from './ResourceSvg';
import {locationPropTypes} from './Models';
import {Decimal} from 'decimal.js';
import moment from 'moment';
import {submitBooking} from './Api';

const GenericResourceSelector = (props) => {
    const {location, apiBackend, locationSlug} = props;

    const [selectedResource, setSelectedResource] = React.useState('');
    const [selectedTimespan, setSelectedTimespan] = React.useState('');
    const [bookingBegin, setBookingBegin] = React.useState(null);
    const [bookingEnd, setBookingEnd] = React.useState(null);
    const [bookingPrice, setBookingPrice] = React.useState(null);

    const calculatePrice = (resource, timespan) => {
        if (!resource || !timespan)
            return null;
        return Decimal(resource.pricegroup['fee_' + timespan]);
    };

    const updateSelectedResource = (resource_id) => {
        let newSelectedResource = location.resource.filter(resource => resource.id === resource_id);
        if (!newSelectedResource.length) {
            setSelectedResource('');
        } else if (newSelectedResource[0].pricegroup['fee_' + selectedTimespan] === undefined) {
            setSelectedResource(newSelectedResource[0]);
            setSelectedTimespan('');
            setBookingPrice(null);
        } else {
            setSelectedResource(newSelectedResource[0]);
            setBookingPrice(calculatePrice(newSelectedResource[0], selectedTimespan));
        }
    };

    const handleSelectedResourceUpdate = (e) => {
        updateSelectedResource(parseInt(e.target.value));
    };

    const handleSelectedTimespanChange = (e) => {
        const value = e.target.value;
        if (value === 'none') {
            setSelectedTimespan('');
            setBookingBegin(null);
            setBookingEnd(null);
            setBookingPrice(null);
        } else {
            const begin = moment().second(0).minute(0).hour(0);
            let end = begin.clone().add(1, value + 's').add(1, 'day');
            if (value !== 'day') {
                end.add(1, 'day');
            }
            setSelectedTimespan(value);
            setBookingBegin(begin);
            setBookingEnd(end);
            setBookingPrice(calculatePrice(selectedResource, value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedResource && selectedTimespan) {
            submitBooking({
                begin: bookingBegin,
                end: bookingEnd,
                location_id: location.id,
                resource_id: selectedResource.id,
            }).then(() => {
                window.location.href = wc_add_to_cart_params.cart_url;
            });
        }
    };

    return <div>
        <h2 className="column is-12">{location.name} buchen</h2>
        <div className="columns control">
            <div className="column is-6">
                <div className="block">
                    <label htmlFor="selector-resource" className="label">Stellplatz</label>
                    <div className="control select is-fullwidth">
                        <select value={(selectedResource) ? selectedResource.id : ''}
                                onChange={handleSelectedResourceUpdate}>
                            <option key="resource-0" value={0}>Bitte wählen</option>
                            {location.resource.filter(resource => resource.status === 'free').map(resource =>
                                <option key={`resource-${resource.id}`}
                                        value={resource.id}>{resource.identifier}</option>,
                            )}
                        </select>
                    </div>
                </div>
                <div className="block">
                    <label htmlFor="selector-timespan" className="label">Mietdauer</label>
                    <div className="control select is-fullwidth">
                        <select
                            value={selectedTimespan}
                            onChange={handleSelectedTimespanChange}
                        >
                            <option key="resource-0" value="none">Bitte wählen</option>
                            {(!selectedResource || selectedResource.pricegroup.fee_day !== undefined) &&
                            <option value="day">Tag</option>}
                            {(!selectedResource || selectedResource.pricegroup.fee_week !== undefined) &&
                            <option value="week">Woche</option>}
                            {(!selectedResource || selectedResource.pricegroup.fee_month !== undefined) &&
                            <option value="month">Monat</option>}
                            {(!selectedResource || selectedResource.pricegroup.fee_year !== undefined) &&
                            <option value="year">Jahr</option>}
                        </select>
                    </div>
                </div>
                <div className="block">
                    {bookingEnd && <p style={{marginBottom: '0.5em'}}>Buchung bis
                        zum {bookingEnd.clone().subtract(1, 'day').format('D.M.YY, 24:00')} Uhr</p>}
                    {bookingPrice &&
                    <h3 style={{marginTop: 0}}>Preis: {formatPrice(bookingPrice)}</h3>}
                    <button
                        onClick={handleSubmit}
                        className={`button is-fullwidth ${(selectedResource && selectedTimespan) ? 'is-success' : ''}`}
                        disabled={!(selectedResource && selectedTimespan)}
                    >
                        Buchen
                    </button>
                </div>
                {!!location.description && <div className="block">
                    {location.description}
                </div>}
            </div>
            <div className="column is-6">
                <ResourceSvg
                    apiBackend={apiBackend}
                    locationSlug={locationSlug}
                    selectedResource={selectedResource}
                    updateSelectedResource={updateSelectedResource}
                />
            </div>
        </div>
    </div>;
};

GenericResourceSelector.propTypes = {
    location: PropTypes.shape(locationPropTypes).isRequired,
    apiBackend: PropTypes.string.isRequired,
    locationSlug: PropTypes.string.isRequired,
};

export default GenericResourceSelector;
