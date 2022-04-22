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

import React, {useState, useEffect} from 'react';

import {getLocations} from '../Api';
import LocationTile from "./LocationTile";
import {userLocalPropTypes} from "../models/user";
import {locationLocalPropTypes} from '../models/location';
import PropTypes from "prop-types";

const ComponentStatus = {
    loading: 1,
    ready: 2,
};


const LocationTileSelector = props => {
    const [status, setStatus] = useState(ComponentStatus.loading);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        getLocations(props.apiBackend).then(locations_data => {
            if (!locations_data) {
                setStatus(ComponentStatus.error);
                return;
            }

            setStatus(ComponentStatus.ready);
            if (props.localUser.type === 'admin') {
                setLocations(locations_data.data);
                return;
            }
            setLocations(locations_data.data.filter(location => {
                let localLocations = props.localLocations.filter(localLocation => localLocation.id === location.id);
                if (!localLocations.length)
                    return false;
                if (localLocations[0].visibility === 'public')
                    return true;
                return props.localUser.locations.indexOf(localLocations[0].wordpress_id) !== -1;
            }));
        })
    }, []);

    const selectLocation = slug => {
        location.href = '/location/' + slug;
    }

    if (status === ComponentStatus.loading)
        return 'Lade Stationen...';
    if (status === ComponentStatus.error)
        return 'Beim Laden der Stationen ist ein serverseitiger Fehler aufgetreten. Bitte versuchen Sie es später erneut.';

    return (
        <div id="obb-location-tiles">
            {[...Array(Math.ceil(locations.length / 3))].map((item, i) =>
                <div className="columns" key={`line-${i}`}>
                    {locations.slice(i * 3, (i + 1) * 3).map((location, j) =>
                        <LocationTile
                            location={location}
                            selectLocation={selectLocation}
                            key={`location-${i}=${j}`}
                        />
                    )}
                </div>,
            )}
        </div>
    );
}

LocationTileSelector.propTypes = {
    apiBackend: PropTypes.string.isRequired,
    localLocations: PropTypes.arrayOf(PropTypes.shape(locationLocalPropTypes)),
    localUser: PropTypes.shape(userLocalPropTypes),
}

export default LocationTileSelector;