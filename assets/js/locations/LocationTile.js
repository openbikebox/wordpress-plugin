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
import PropTypes from "prop-types";
import {locationMinimalPropTypes} from "../models/location";


const LocationTile = props => {
    return (
        <div
            className="column is-4 obb-location-tile"
            onClick={() => props.selectLocation(props.location.slug)}
        >
            <figure className="image is-3by2">
                <img src={props.location.photo.url} alt={`Station ${props.location.name}`}/>
            </figure>
            <h4>{props.location.name}</h4>
            <p>
                <i className="fa fa-map-marker" aria-hidden="true" />{' '}
                {props.location.locality}{' '}
                <i className="fa fa-bicycle" aria-hidden="true" />{' '}
                {props.location.ressource_count} Räder
            </p>
            <button className="button is-fullwidth is-success">Jetzt Buchen</button>
        </div>
    );
}

LocationTile.propTypes = {
    selectLocation: PropTypes.func,
    location: PropTypes.shape(locationMinimalPropTypes),
}

export default LocationTile;