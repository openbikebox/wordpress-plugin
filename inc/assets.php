<?php
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

defined('ABSPATH') or die('nope.');

add_action( 'wp_enqueue_scripts', function() {
    if (!file_exists(OPEN_BIKE_BOX_BASE_PATH . 'static/webpack-assets.json'))
        return;
    $assets_data = file_get_contents(OPEN_BIKE_BOX_BASE_PATH . 'static/webpack-assets.json');
    if (!$assets_data)
        return;
    $assets = json_decode($assets_data);
    if (isset($assets->main->css)) {
        wp_enqueue_style(
            'openbikebox',
            OPEN_BIKE_BOX_BASE_URL . $assets->main->css, array(),
            OPEN_BIKE_BOX_VERSION
        );
    }
    if (isset($assets->main->js)) {
        wp_enqueue_script(
            'openbikebox',
            OPEN_BIKE_BOX_BASE_URL . $assets->main->js, array('jquery'),
            OPEN_BIKE_BOX_VERSION,
            true
        );
    }
});
