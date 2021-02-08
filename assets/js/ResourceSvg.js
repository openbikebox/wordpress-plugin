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
import { getLocationBySlug } from './Api';
import { ComponentStatus } from "./Helpers";

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
                if (xy[1] > max_y)
                    max_y = xy[1];
                if (xy[0] > max_x)
                    max_x = xy[0];
            }
        }
        this.setState({
            locationGeojson: locationGeojson,
            locationMaxX: max_x,
            locationMaxY: max_y,
            status: ComponentStatus.ready
        });
    }

    selectResource(resource_id, status) {
        if (status !== 'free')
            return;
        this.props.updateSelectedResource(resource_id)
    }

    render() {
        if (this.state.status === ComponentStatus.loading)
            return <div>...</div>;
        return (
            <div className="resource-svg">
                <svg viewBox={`-0.05 -0.05 ${this.state.locationMaxX + 0.10} ${this.state.locationMaxY + 0.10}`}>
                    {this.state.locationGeojson.features.map(feature => {
                        let polygon = feature.geometry.coordinates[0];
                        let points = [
                            String(polygon[0][0] + 0.05) + ',' + String(polygon[0][1] - 0.05),
                            String(polygon[1][0] + 0.05) + ',' + String(polygon[1][1] + 0.05),
                            String(polygon[2][0] - 0.05) + ',' + String(polygon[2][1] + 0.05),
                            String(polygon[3][0] - 0.05) + ',' + String(polygon[3][1] - 0.05),
                            String(polygon[0][0] + 0.05) + ',' + String(polygon[0][1] - 0.05)
                        ];
                        return(
                            <polygon
                                key={`polygon-${feature.properties.id}`}
                                points={points.join(' ')}
                                data-status={feature.properties.status}
                                className={`status-${feature.properties.status}${(this.props.selectedResource && this.props.selectedResource.id === feature.properties.id) ? ' active' : ''}`}
                                onClick={this.selectResource.bind(this, feature.properties.id, feature.properties.status)}
                            />
                        );
                    })}
                    {this.state.locationGeojson.features.map(feature => {
                        return(
                            <text
                                key={`text-${feature.properties.id}`}
                                x={feature.geometry.coordinates[0][0][0] + 0.5}
                                y={feature.geometry.coordinates[0][0][1] - 0.5}
                                className={`status-${feature.properties.status}`}
                                onClick={this.selectResource.bind(this, feature.properties.id, feature.properties.status)}
                            >{feature.properties.identifier}</text>
                        );
                    })}
                </svg>
            </div>
        );
    }
}
