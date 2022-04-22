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
import PropTypes from 'prop-types';
const { useState, useEffect } = React;
import { getLocationBySlug } from '../Api';
import { ComponentStatus } from "../Helpers";

const ResourceSvg = props => {
    const [status, setStatus] = useState(ComponentStatus.loading);
    const [locationMaxX, setLocationMaxX] = useState();
    const [locationMaxY, setLocationMaxY] = useState();
    const [locationGeojson, setLocationGeojson] = useState();


    useEffect(() => {
        getLocationBySlug(props.apiBackend, props.locationSlug, 'geojson')
            .then(newLocationGeojson => {
                let max_x = 0;
                let max_y = 0;
                for (let feature of newLocationGeojson.features) {
                    if (!feature.geometry.coordinates.length)
                        continue;
                    for (let xy of feature.geometry.coordinates[0]) {
                        if (xy[1] > max_y)
                            max_y = xy[1];
                        if (xy[0] > max_x)
                            max_x = xy[0];
                    }
                }
                setLocationGeojson(newLocationGeojson);
                setLocationMaxX(max_x);
                setLocationMaxY(max_y);
                setStatus(ComponentStatus.ready);
            });
    }, []);

    const selectResource = (resource_id, status) => {
        if (status !== 'free')
            return;
        props.updateSelectedResource(resource_id)
    }

    if (status === ComponentStatus.loading)
        return <div>...</div>;
    return <div className="resource-svg">
        <svg viewBox={`-0.05 -0.05 ${locationMaxX + 0.10} ${locationMaxY + 0.10}`}>
            {locationGeojson.features.map(feature => {
                let polygon = feature.geometry.coordinates[0];
                let points = [
                    String(polygon[0][0] + 0.05) + ',' + String(polygon[0][1] - 0.05),
                    String(polygon[1][0] + 0.05) + ',' + String(polygon[1][1] + 0.05),
                    String(polygon[2][0] - 0.05) + ',' + String(polygon[2][1] + 0.05),
                    String(polygon[3][0] - 0.05) + ',' + String(polygon[3][1] - 0.05),
                    String(polygon[0][0] + 0.05) + ',' + String(polygon[0][1] - 0.05)
                ];
                return <polygon
                    key={`polygon-${feature.properties.id}`}
                    points={points.join(' ')}
                    data-status={feature.properties.status}
                    className={`status-${feature.properties.status}${(props.selectedResource && props.selectedResource.id === feature.properties.id) ? ' active' : ''}`}
                    onClick={() => selectResource(feature.properties.id, feature.properties.status)}
                />
            })}
            {locationGeojson.features.map(feature => {
                return <text
                    key={`text-${feature.properties.id}`}
                    x={feature.geometry.coordinates[0][0][0] + 0.5}
                    y={feature.geometry.coordinates[0][0][1] - 0.5}
                    className={`status-${feature.properties.status}`}
                    onClick={() => selectResource(feature.properties.id, feature.properties.status)}
                >{feature.properties.identifier}</text>
            })}
        </svg>
    </div>
}

ResourceSvg.propTypes = {
    apiBackend: PropTypes.string,
    locationSlug: PropTypes.string,
    updateSelectedResource: PropTypes.func,
}

export default ResourceSvg;