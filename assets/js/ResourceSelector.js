/*
openbikebox Frontend
Copyright (C) 2021 binary butterfly GmbH

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React from 'react';

import {Decimal} from 'decimal.js';
import moment from 'moment';
import {getLocationBySlug, submitBooking} from './Api';
import {formatPrice} from './Format';
import {ComponentStatus} from './Helpers';
import ResourceSvg from './ResourceSvg';

const ResourceSelector = (props) => {
    const [selectedResource, setSelectedResource] = React.useState('');
    const [selectedTimespan, setSelectedTimespan] = React.useState('');
    const [bookingBegin, setBookingBegin] = React.useState(null);
    const [bookingEnd, setBookingEnd] = React.useState(null);
    const [bookingPrice, setBookingPrice] = React.useState(null);
    const [status, setStatus] = React.useState(ComponentStatus.loading);
    const [location, setLocation] = React.useState(null);

    React.useEffect(() => {
        const func = async () => {
            const fetchedLocation = await getLocationBySlug(props.apiBackend, props.locationSlug);
            if (fetchedLocation) {
                setLocation(fetchedLocation.data);
                setStatus(ComponentStatus.ready);
            } else {
                setStatus(ComponentStatus.error);
            }
        };
        func().then();
    }, []);

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

    if (status === ComponentStatus.loading) {
        return <p>Lade Stationsdaten...</p>;
    } else if (status === ComponentStatus.error) {
        return <p>Beim Laden der Station is ein serverseitiger Fehler aufgetreten.<br/>
            Bitte versuchen Sie es später erneut.</p>;
    }

    return (
        <div>
            <h2 className="column is-12">{location.name} buchen</h2>
            <div className="columns control">
                <div className="column is-6">
                    <div className="block">
                        <label htmlFor="selector-resource" className="label">Stellplatz</label>
                        <div className="control select is-fullwidth">
                            <select value={(selectedResource) ? selectedResource.id : ''}
                                    onChange={handleSelectedResourceUpdate}>
                                <option key="resource-0" value={0}>bitte wählen</option>
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
                                <option key="resource-0" value="none">bitte wählen</option>
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
                            buchen
                        </button>
                    </div>
                    {!!location.description && <div className="block">
                        {location.description}
                    </div>}
                </div>
                <div className="column is-6">
                    <ResourceSvg
                        apiBackend={props.apiBackend}
                        locationSlug={props.locationSlug}
                        selectedResource={selectedResource}
                        updateSelectedResource={updateSelectedResource}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResourceSelector;
