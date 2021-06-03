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

import '../sass/base.scss'
import '../sass/webapp.scss'

import React from "react";
import ReactDOM from "react-dom";

import LocationTileSelector from './LocationTileSelector';
import LocationView from './LocationView'
import { transformAttribute } from './Helpers';

document.addEventListener('DOMContentLoaded', function(event) {
    let reactObjects = {
        'obb-resource-select-box': LocationView,
        'obb-location-tiles-box': LocationTileSelector,
        'obb-resource-select-box': LocationView
    };

    for (const [html_id, ReactClass] of Object.entries(reactObjects)) {
        let dom_obj = document.getElementById(html_id);
        if (dom_obj) {
            let props = {};
            dom_obj.getAttributeNames().filter(key => key.substr(0, 5) === 'data-').forEach(key => {
                props[transformAttribute(key.substr(5))] = dom_obj.getAttribute(key)
            })
            ReactDOM.render(
                <ReactClass{...props}/>,
                dom_obj
            );
        }
    }
});
