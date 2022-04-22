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
import {getLocationBySlug, getLocations} from '../Api';
import { ComponentStatus } from "../Helpers";
import { MapContainer, GeoJSON, useMapEvents } from "react-leaflet"
import { Map, CRS, geoJSON } from 'leaflet';

export default class ResourceMap extends Component {
    state = {
        status: ComponentStatus.loading,
        mapHeight: '500px'
    }

    async componentDidMount() {
        const locationGeojson = await getLocationBySlug(this.props.apiBackend, this.props.locationSlug, 'geojson');
        let max_x = 0;
        let max_y = 0;
        for (let feature of locationGeojson.features) {
            if (!feature.geometry.coordinates.length)
                continue;
            for (let xy of feature.geometry.coordinates[0]) {
                if (xy[0] > max_y)
                    max_y = xy[0];
                if (xy[1] > max_x)
                    max_x = xy[1];
            }
        }
        this.map = new Map('map', {
            zoomSnap: 0.001,
            crs: CRS.Simple,
            zoom: 0,
            center: [max_x / 2, max_y / 2],
            maxBounds: [[0, 0], [max_x, max_y]],
            maxBoundsViscosity: 1
        });
        this.map.fitBounds([[0, 0], [max_y, max_y]])

        L.geoJSON(locationGeojson).addTo(this.map)
        /*
        this.setState({
            locationGeojson: locationGeojson,
            locationMaxX: max_x,
            locationMaxY: max_y,
            status: ComponentStatus.ready
        });
        */
    }

    render() {
        return <div id="map" style={{height: this.state.mapHeight}}></div>;
        /*
        return (
            <MapContainer
                center={[this.state.locationMaxX / 2, this.state.locationMaxY / 2]}
                crs={CRS.Simple}
                zoom={0}
                style={{height: '520px'}}
                maxBounds={[[0, 0], [this.state.locationMaxX, this.state.locationMaxY]]}
            >
                <MapEvents />
                <GeoJSON data={this.state.locationGeojson} />
            </MapContainer>
        )
        */
    }
}

export const MapEvents = () => {
    const map = useMapEvents({
        click(evt) {
        },
    })
    return null;
}