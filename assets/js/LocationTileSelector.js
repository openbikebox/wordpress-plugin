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
import { getLocations } from './Api';

const ComponentStatus = {
    loading: 1,
    ready: 2
}


export default class LocationTileSelector extends Component {
    state = {
        status: ComponentStatus.loading
    }

    async componentDidMount() {
        const location = await getLocations(this.props.apiBackend);
        this.setState({
            locations: location.data,
            status: ComponentStatus.ready
        });
    }

    render() {
        if (this.state.status === ComponentStatus.loading)
            return '...';
        return (
            <div id="obb-location-tiles" className="columns">
                {this.state.locations.map((location, i) => this.renderLocationTile(location, i))}
            </div>
        )
    }

    selectLocation(slug) {
        location.href = '/location/' + slug;
    }

    renderLocationTile(location, i) {
        return (
            <div
                key={`location-${location.id}`}
                className="column is-4 obb-location-tile"
                onClick={this.selectLocation.bind(this, location.slug)}
            >
                <figure className="image is-3by2">
                    <img src={location.photo.url} alt={`Station ${location.name}`} />
                </figure>
                <h4>{location.name}</h4>
                <p>
                    <i className="fa fa-map-marker" aria-hidden="true"></i>{' '}
                    {location.locality}{' '}
                    <i className="fa fa-bicycle" aria-hidden="true"></i>{' '}
                    {location.ressource_count} Räder
                </p>
                <button className="button is-fullwidth is-success">jetzt buchen</button>
            </div>
        )
    }
}