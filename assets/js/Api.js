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

import {requestGet, requestAdminAjaxPost} from "./Helpers";


export const getLocations = (base_url) => {
    return requestGet(base_url + '/api/v1/locations');
}

export const getLocation = (base_url, location_id, format) => {
    return requestGet(base_url + '/api/v1/location/' + String(location_id) + ((format) ? '?format=format' : ''));
}

export const getLocationBySlug = (base_url, location_slug, format) => {
    let params = ['slug=' + location_slug];
    if (format)
        params.push('format=' + format)
    return requestGet(base_url + '/api/v1/location?' + params.join('&'));
}

export const getResourceBySlug = (base_url, resource_slug) => {
    let params = ['slug=' + resource_slug];
    return requestGet(base_url + '/api/v1/resource?' + params.join('&'));
}

export const getResourceActions = (base_url, resource_id) => {
    return requestGet(base_url + '/api/v1/resource/' + String(resource_id) + '/actions');
}

export const submitBooking = (data) => {
    return requestAdminAjaxPost(
        wc_add_to_cart_params.ajax_url,
        'obb_add_to_cart',
        data
    );
}