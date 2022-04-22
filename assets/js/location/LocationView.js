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

import {getLocationBySlug} from '../Api';
import {ComponentStatus} from '../Helpers';
import GenericResourceSelector from '../resource/GenericResourceSelector';
import ResourceList from './ResourceList';

const LocationView = props => {
    const [status, setStatus] = React.useState(ComponentStatus.loading);
    const [location, setLocation] = React.useState(null);

    React.useEffect(() => {
        getLocationBySlug(props.apiBackend, props.locationSlug).then(fetchedLocation => {
            if (!fetchedLocation) {
                setStatus(ComponentStatus.error);
                return;
            }
            if (props.localUser.type === 'admin') {
                setLocation(fetchedLocation.data);
                setStatus(ComponentStatus.ready);
                return;
            }
            let localLocations = props.localLocations.filter(localLocation => localLocation.id === fetchedLocation.data.id);
            if (!localLocations.length) {
                setStatus(ComponentStatus.accessDenied);
                return;
            }
            if (localLocations[0].visibility !== 'public' && props.localUser.locations.indexOf(localLocations[0].wordpress_id) === -1) {
                setStatus(ComponentStatus.accessDenied);
                return;
            }
            setLocation(fetchedLocation.data);
            setStatus(ComponentStatus.ready);

        });
    }, []);

    if (status === ComponentStatus.loading)
        return <p>Lade Stationsdaten...</p>

    if (status === ComponentStatus.accessDenied)
        return <p>Kein Zugriff</p>

    if (status === ComponentStatus.error)
        return <p>
            Beim Laden der Station is ein serverseitiger Fehler aufgetreten.<br/>
            Bitte versuchen Sie es später erneut.
        </p>

    if (location.type === 'cargobike') {
        return <ResourceList location={location}/>;
    }

    return <GenericResourceSelector location={location} apiBackend={props.apiBackend} locationSlug={props.locationSlug} />;
};

export default LocationView;
