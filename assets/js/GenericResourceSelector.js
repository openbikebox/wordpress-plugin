import React from 'react';
import PropTypes from 'prop-types';
import {formatPrice} from './Format';
import ResourceSvg from './ResourceSvg';
import {locationPropTypes} from './Models';
import {Decimal} from 'decimal.js';
import moment from 'moment';
import {submitBooking} from './Api';
import { Carousel } from 'react-responsive-carousel';

const GenericResourceSelector = (props) => {
    const {location, apiBackend, locationSlug} = props;

    const [selectedResource, setSelectedResource] = React.useState('');
    const [selectedTimespan, setSelectedTimespan] = React.useState('');
    const [bookingBegin, setBookingBegin] = React.useState(null);
    const [bookingEnd, setBookingEnd] = React.useState(null);
    const [bookingPrice, setBookingPrice] = React.useState(null);
    const [termsAndConditions, setTermsAndConditions] = React.useState(false);
    const [bikeSize, setBikeSize] = React.useState(false);
    const [termsAndConditionsError, setTermsAndConditionsError] = React.useState(false);
    const [bikeSizeError, setBikeSizeError] = React.useState(false);

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
        if (selectedResource && selectedTimespan && termsAndConditions && (!location.bike_size_information || bikeSize)) {
            submitBooking({
                begin: bookingBegin.toISOString().substr(0, 19) + 'Z',
                end: bookingEnd.toISOString().substr(0, 19) + 'Z',
                location_id: location.id,
                resource_id: selectedResource.id,
                predefined_daterange: selectedTimespan
            }).then(() => {
                window.location.href = wc_add_to_cart_params.cart_url;
            });
        }
        else {
            setTermsAndConditionsError(!termsAndConditions);
            setBikeSizeError(location.bike_size_information && !bikeSize)
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
                                <option key={`resource-${resource.id}`} value={resource.id}>
                                    {resource.identifier}
                                </option>,
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
                            {(!selectedResource || selectedResource.pricegroup.fee_quarter !== undefined) &&
                            <option value="quarter">Quartal</option>}
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
                    {!!location.bike_size_information && <p>
                        <label className="checkbox" style={{color: (bikeSizeError) ? '#f14668': 'inherit'}}>
                            <input
                                type="checkbox"
                                onChange={() => setBikeSize(!bikeSize)}
                                value={bikeSize}
                            />
                            {' '}{location.bike_size_information}
                        </label>
                    </p>}
                    <p>
                        <label className="checkbox" style={{color: (termsAndConditionsError) ? '#f14668': 'inherit'}}>
                            <input
                                type="checkbox"
                                onChange={() => setTermsAndConditions(!termsAndConditions)}
                                value={termsAndConditions}
                            />
                            {' '}Ich habe die{' '}
                            <a href={location.terms_and_conditions} target={'_blank'} onClick={evt => evt.stopPropagation()}>Geschäftsbedingungen</a>
                            {' '}gelesen und stimme ihnen zu.
                        </label>
                    </p>

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
                {location.photos.length && <Carousel>
                    {location.photos.map(photo => <div key={`photo-${photo.id}`}>
                        <img src={photo.url} alt={`Photo von ${location.name}`} />
                    </div>)}
                </Carousel>}
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
