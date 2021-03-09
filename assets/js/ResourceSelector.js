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

import React from "react";
const { Component } = React;
import {Decimal} from 'decimal.js';
import moment from 'moment';
import { getLocationBySlug, submitBooking } from './Api';
import { formatPrice } from './Format';
import { ComponentStatus } from "./Helpers";
import ResourceSvg from './ResourceSvg';


export default class ResourceSelector extends Component {
    state = {
        selectedResource: null,
        status: ComponentStatus.loading
    }

    async componentDidMount() {
        const location = await getLocationBySlug(this.props.apiBackend, this.props.locationSlug);
        this.setState({
            location: location.data,
            status: ComponentStatus.ready
        });
    }

    updateSelectedResourceEvt(evt) {
        this.updateSelectedResource(parseInt(evt.target.value));
    }

    updateSelectedResource(resource_id) {
        let selectedResource = this.state.location.resource.filter(resource => resource.id === resource_id);
        if (!selectedResource.length) {
            this.setState({
                selectedResource: null
            });
            return;
        }
        this.setState({
            selectedResource: selectedResource[0],
            bookingPrice: this.calculatePrice(selectedResource[0], this.state.selectedTimespan)
        });
    }

    updateSelectedTimespan(evt) {
        if (evt.target.value === 0) {
            return this.setState({
                selectedTimespan: null,
                bookingBegin: null,
                bookingEnd: null,
                bookingPrice: null
            });
        }
        let begin = moment().second(0).minute(0).hour(0);
        let end = begin.clone().add(1, evt.target.value + 's').add(1, 'day');
        if (evt.target.value !== 'day') {
            end.add(1, 'day');
        }
        this.setState({
            selectedTimespan: evt.target.value,
            bookingBegin: begin,
            bookingEnd: end,
            bookingPrice: this.calculatePrice(this.state.selectedResource, evt.target.value)
        });
    }

    calculatePrice(resource, timespan) {
        if (!resource || !timespan)
            return null;
        return Decimal(resource.pricegroup['fee_' + timespan]);
    }

    submit(evt) {
        evt.preventDefault();
        if (!this.state.selectedResource || !this.state.selectedTimespan)
            return;
        submitBooking({
            begin: this.state.bookingBegin.toISOString().substr(0, 19) + 'Z',
            end: this.state.bookingEnd.toISOString().substr(0, 19) + 'Z',
            location_id: this.state.location.id,
            resource_id: this.state.selectedResource.id
        }).then(result => {
            window.location.href = wc_add_to_cart_params.cart_url;
        })
    }

    render() {
        if (this.state.status === ComponentStatus.loading) {
            return <div>...</div>;
        }
        return (
            <div>
                <h2 className="column is-12">{this.state.location.name} buchen</h2>
                <div className="columns control">
                    <div className="column is-6">
                        <div className="block">
                            <label htmlFor="selector-resource" className="label">Stellplatz</label>
                            <div className="control select is-fullwidth">
                                <select value={(this.state.selectedResource) ? this.state.selectedResource.id : ''} onChange={this.updateSelectedResourceEvt.bind(this)}>
                                    <option key='resource-0' value={0}>bitte wählen</option>
                                    {this.state.location.resource.filter(resource => resource.status === 'free').map(resource =>
                                        <option key={`resource-${resource.id}`} value={resource.id}>{resource.identifier}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="block">
                            <label htmlFor="selector-timespan" className="label">Mietdauer</label>
                            <div className="control select is-fullwidth">
                                <select
                                    value={this.state.selectedTimespan}
                                    onChange={this.updateSelectedTimespan.bind(this)}
                                >
                                    <option key='resource-0' value={0}>bitte wählen</option>
                                    <option value="day">Tag</option>
                                    <option value="week">Woche</option>
                                    <option value="month">Monat</option>
                                    <option value="year">Jahr</option>
                                </select>
                            </div>
                        </div>
                        <div className="block">
                            {this.state.bookingEnd && <p style={{marginBottom: '0.5em'}}>Buchung bis zum {this.state.bookingEnd.clone().subtract(1, 'day').format('D.M.YY, 24:00')} Uhr</p>}
                            {this.state.bookingPrice && <h3 style={{marginTop: 0}}>Preis: {formatPrice(this.state.bookingPrice)}</h3>}
                            <button
                                onClick={this.submit.bind(this)}
                                className={`button is-fullwidth ${(this.state.selectedResource && this.state.selectedTimespan) ? 'is-success' : ''}`}
                                disabled={!(this.state.selectedResource && this.state.selectedTimespan)}
                            >
                                buchen
                            </button>
                        </div>
                        {!!this.state.location.description && <div className="block">
                            {this.state.location.description}
                        </div>}
                    </div>
                    <div className="column is-6">
                        <ResourceSvg
                            apiBackend={this.props.apiBackend}
                            locationSlug={this.props.locationSlug}
                            selectedResource={this.state.selectedResource}
                            updateSelectedResource={this.updateSelectedResource.bind(this)}
                        />
                    </div>
                </div>
            </div>
        )
    }
}